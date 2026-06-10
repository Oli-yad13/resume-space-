import { HttpService } from "@nestjs/axios";
import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ResumeDto } from "@resume-space/dto";
import { ErrorMessage } from "@resume-space/utils";
import retry from "async-retry";
import { PDFDocument } from "pdf-lib";
import { connect, type Browser, type Page as PuppeteerPage } from "puppeteer";

import { Config } from "../config/schema";
import { StorageService } from "../storage/storage.service";

@Injectable()
export class PrinterService {
  private readonly logger = new Logger(PrinterService.name);

  private readonly exportTimeoutMs = 45_000;

  private readonly browserURL: string;

  private readonly ignoreHTTPSErrors: boolean;

  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly storageService: StorageService,
    private readonly httpService: HttpService,
  ) {
    const chromeUrl = this.configService.getOrThrow<string>("CHROME_URL");
    const chromeToken = this.configService.getOrThrow<string>("CHROME_TOKEN");

    this.browserURL = `${chromeUrl}?token=${chromeToken}`;
    this.ignoreHTTPSErrors = this.configService.getOrThrow<boolean>("CHROME_IGNORE_HTTPS_ERRORS");
  }

  private async getBrowser() {
    try {
      return await connect({
        browserWSEndpoint: this.browserURL,
        acceptInsecureCerts: this.ignoreHTTPSErrors,
        protocolTimeout: this.exportTimeoutMs,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        ErrorMessage.InvalidBrowserConnection,
        (error as Error).message,
      );
    }
  }

  private withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
    let timeout: NodeJS.Timeout;

    const timeoutPromise = new Promise<T>((_resolve, reject) => {
      timeout = setTimeout(() => {
        reject(new Error(`${label} timed out after ${this.exportTimeoutMs / 1000}s`));
      }, this.exportTimeoutMs);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => {
      clearTimeout(timeout);
    });
  }

  private async waitForArtboard(page: PuppeteerPage) {
    await page.waitForSelector('[data-page="1"]', { timeout: 15_000 });

    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              window.setTimeout(resolve, 250);
            });
          });
        }),
    );
  }

  async getVersion() {
    const browser = await this.getBrowser();
    const version = await browser.version();
    await browser.disconnect();
    return version;
  }

  async printResume(resume: ResumeDto) {
    const start = performance.now();

    const url = await retry<string | undefined>(() => this.generateResume(resume), {
      retries: 1,
      randomize: true,
      onRetry: (_, attempt) => {
        this.logger.log(`Retrying to print resume #${resume.id}, attempt #${attempt}`);
      },
    });

    const duration = +(performance.now() - start).toFixed(0);
    const numberPages = resume.data.metadata.layout.length;

    this.logger.debug(`Chrome took ${duration}ms to print ${numberPages} page(s)`);

    return url;
  }

  async printPreview(resume: ResumeDto) {
    const start = performance.now();

    const url = await retry(() => this.generatePreview(resume), {
      retries: 1,
      randomize: true,
      onRetry: (_, attempt) => {
        this.logger.log(
          `Retrying to generate preview of resume #${resume.id}, attempt #${attempt}`,
        );
      },
    });

    const duration = +(performance.now() - start).toFixed(0);

    this.logger.debug(`Chrome took ${duration}ms to generate preview`);

    return url;
  }

  async generateResume(resume: ResumeDto) {
    let browser: Browser | null = null;
    let page: PuppeteerPage | null = null;

    try {
      browser = await this.withTimeout(this.getBrowser(), "Connecting to Browserless");
      page = await browser.newPage();
      page.setDefaultNavigationTimeout(this.exportTimeoutMs);
      page.setDefaultTimeout(this.exportTimeoutMs);

      const publicUrl = this.configService.getOrThrow<string>("PUBLIC_URL");
      const storageUrl = this.configService.getOrThrow<string>("STORAGE_URL");

      let url = publicUrl;

      if ([publicUrl, storageUrl].some((url) => /https?:\/\/localhost(:\d+)?/.test(url))) {
        // Switch client URL from `http[s]://localhost[:port]` to `http[s]://host.docker.internal[:port]` in development
        // This is required because the browser is running in a container and the client is running on the host machine.
        url = url.replace(
          /localhost(:\d+)?/,
          (_match, port) => `host.docker.internal${port ?? ""}`,
        );

        await page.setRequestInterception(true);

        // Intercept requests of `localhost` to `host.docker.internal` in development
        page.on("request", (request) => {
          if (request.url().startsWith(storageUrl)) {
            const modifiedUrl = request
              .url()
              .replace(/localhost(:\d+)?/, (_match, port) => `host.docker.internal${port ?? ""}`);

            void request.continue({ url: modifiedUrl });
          } else {
            void request.continue();
          }
        });
      }

      await page.evaluateOnNewDocument((data) => {
        window.localStorage.setItem("resume", JSON.stringify(data));
      }, resume.data);

      await page.setViewport({ width: 794, height: 1123 });

      await this.withTimeout(
        page.goto(`${url}/artboard/preview`, { waitUntil: "domcontentloaded" }),
        "Loading the resume preview",
      );
      await this.withTimeout(this.waitForArtboard(page), "Rendering resume pages");

      // Count actual rendered pages (auto-pagination may add more pages than metadata.layout.length)
      const numberPages = await page.$$eval("[data-page]", (els) => els.length);
      if (numberPages === 0) throw new Error("No resume pages were rendered");

      const pagesBuffer: Buffer[] = [];
      const activePage = page;

      const processPage = async (index: number) => {
        const pageElement = await activePage.$(`[data-page="${index}"]`);
        if (!pageElement) {
          throw new Error(`Could not find rendered page ${index}`);
        }

        const { width, height } = await activePage.evaluate((element: HTMLDivElement) => {
          const rect = element.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        }, pageElement);

        const temporaryHtml = await activePage.evaluate((element: HTMLDivElement) => {
          const clonedElement = element.cloneNode(true) as HTMLDivElement;
          const temporaryHtml_ = document.body.innerHTML;
          document.body.innerHTML = clonedElement.outerHTML;
          return temporaryHtml_;
        }, pageElement);

        // Apply custom CSS, if enabled
        const css = resume.data.metadata.css;

        if (css.visible) {
          await activePage.evaluate((cssValue: string) => {
            const styleTag = document.createElement("style");
            styleTag.textContent = cssValue;
            document.head.append(styleTag);
          }, css.value);
        }

        const uint8array = await this.withTimeout(
          activePage.pdf({
            width: `${Math.ceil(width)}px`,
            height: `${Math.ceil(height)}px`,
            printBackground: true,
          }),
          `Printing page ${index}`,
        );
        const buffer = Buffer.from(uint8array);
        pagesBuffer.push(buffer);

        await activePage.evaluate((temporaryHtml_: string) => {
          document.body.innerHTML = temporaryHtml_;
        }, temporaryHtml);
      };

      // Loop through all the pages and print them, by first displaying them, printing the PDF and then hiding them back
      for (let index = 1; index <= numberPages; index++) {
        await processPage(index);
      }

      // Using 'pdf-lib', merge all the pages from their buffers into a single PDF
      const pdf = await PDFDocument.create();

      for (const element of pagesBuffer) {
        const page = await PDFDocument.load(element);
        const [copiedPage] = await pdf.copyPages(page, [0]);
        pdf.addPage(copiedPage);
      }

      // Save the PDF to storage and return the URL to download the resume
      // Store the URL in cache for future requests, under the previously generated hash digest
      const buffer = Buffer.from(await pdf.save());

      // This step will also save the resume URL in cache
      const resumeUrl = await this.withTimeout(
        this.storageService.uploadObject(resume.userId, "resumes", buffer, resume.title),
        "Uploading exported PDF",
      );

      return resumeUrl;
    } catch (error) {
      this.logger.error(error);

      throw new InternalServerErrorException({
        message: ErrorMessage.ResumePrinterError,
        error: (error as Error).message,
      });
    } finally {
      await page?.close().catch(() => null);
      await browser?.disconnect().catch(() => null);
    }
  }

  async generatePreview(resume: ResumeDto) {
    let browser: Browser | null = null;
    let page: PuppeteerPage | null = null;

    try {
      browser = await this.withTimeout(this.getBrowser(), "Connecting to Browserless");
      page = await browser.newPage();
      page.setDefaultNavigationTimeout(this.exportTimeoutMs);
      page.setDefaultTimeout(this.exportTimeoutMs);

      const publicUrl = this.configService.getOrThrow<string>("PUBLIC_URL");
      const storageUrl = this.configService.getOrThrow<string>("STORAGE_URL");

      let url = publicUrl;

      if ([publicUrl, storageUrl].some((url) => /https?:\/\/localhost(:\d+)?/.test(url))) {
        // Switch client URL from `http[s]://localhost[:port]` to `http[s]://host.docker.internal[:port]` in development
        // This is required because the browser is running in a container and the client is running on the host machine.
        url = url.replace(
          /localhost(:\d+)?/,
          (_match, port) => `host.docker.internal${port ?? ""}`,
        );

        await page.setRequestInterception(true);

        // Intercept requests of `localhost` to `host.docker.internal` in development
        page.on("request", (request) => {
          if (request.url().startsWith(storageUrl)) {
            const modifiedUrl = request
              .url()
              .replace(/localhost(:\d+)?/, (_match, port) => `host.docker.internal${port ?? ""}`);

            void request.continue({ url: modifiedUrl });
          } else {
            void request.continue();
          }
        });
      }

      await page.evaluateOnNewDocument((data) => {
        window.localStorage.setItem("resume", JSON.stringify(data));
      }, resume.data);

      await page.setViewport({ width: 794, height: 1123 });

      await this.withTimeout(
        page.goto(`${url}/artboard/preview`, { waitUntil: "domcontentloaded" }),
        "Loading the resume preview",
      );
      await this.withTimeout(this.waitForArtboard(page), "Rendering resume pages");

      const uint8array = await this.withTimeout(
        page.screenshot({ quality: 80, type: "jpeg" }),
        "Capturing resume preview",
      );
      const buffer = Buffer.from(uint8array);

      return await this.withTimeout(
        this.storageService.uploadObject(resume.userId, "previews", buffer, resume.id),
        "Uploading resume preview",
      );
    } finally {
      await page?.close().catch(() => null);
      await browser?.disconnect().catch(() => null);
    }
  }
}
