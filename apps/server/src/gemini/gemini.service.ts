import { GoogleGenerativeAI } from "@google/generative-ai";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import JSZip from "jszip";

import { Config } from "../config/schema";

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor(private readonly configService: ConfigService<Config>) {
    this.initializeGemini();
  }

  private initializeGemini() {
    const apiKey = this.configService.get("GEMINI_API_KEY");

    if (!apiKey) {
      this.logger.warn(
        "GEMINI_API_KEY is not set. AI-powered features (job matching, CV import) will be disabled.",
      );
      return;
    }

    const modelName = this.configService.get("GEMINI_MODEL") ?? "gemini-2.0-flash";

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: modelName });
      this.logger.log(`Gemini AI initialized successfully (model: ${modelName})`);
    } catch (error) {
      this.logger.error("Failed to initialize Gemini AI", error);
    }
  }

  isAvailable(): boolean {
    return this.model !== null;
  }

  private getErrorMessage(error: unknown) {
    const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";

    if (message.includes("[429 Too Many Requests]") || message.includes("Quota exceeded")) {
      return "Gemini API quota is exhausted for the configured key/model. Enable billing, use a key with available quota, or set GEMINI_MODEL to a model with quota.";
    }

    if (message.includes("[400 Bad Request]")) {
      return "Gemini rejected the request. The uploaded file may be unsupported, too large, or unreadable.";
    }

    if (message.includes("[403 Forbidden]") || message.includes("API key not valid")) {
      return "Gemini API access is not valid for the configured key.";
    }

    if (message) return message;
    return "Unknown error";
  }

  private decodeXmlEntities(text: string) {
    return text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
  }

  private async extractDocxText(buffer: Buffer) {
    const zip = await JSZip.loadAsync(buffer);
    const documentXml = await zip.file("word/document.xml")?.async("text");

    if (!documentXml) {
      throw new Error("Failed to read DOCX document contents");
    }

    const normalized = documentXml
      .replace(/<\/w:p>/g, "\n")
      .replace(/<\/w:tr>/g, "\n")
      .replace(/<w:tab\/>/g, "\t")
      .replace(/<w:br[^>]*\/>/g, "\n")
      .replace(/<[^>]+>/g, "");

    return this.decodeXmlEntities(normalized).replace(/\n{3,}/g, "\n\n").trim();
  }

  async analyzeResumeForJobs(
    resumeData: {
      skills: string[];
      experience: string[];
      experienceYears: number;
      jobTitles: string[];
      education: string[];
    },
    jobs: Array<{
      id: string;
      title: string;
      company: string;
      description: string;
      requirements: string | null;
      category: string;
      experienceLevel: string;
      employmentType: string;
      locationType: string;
      salaryMin: number | null;
      salaryMax: number | null;
      salaryCurrency: string;
      location: string;
    }>,
  ): Promise<
    Array<{
      jobId: string;
      score: number;
      reasoning: string;
    }>
  > {
    if (!this.isAvailable()) {
      throw new Error("Gemini AI is not available");
    }

    const prompt = `
You are an expert job matching AI. Analyze the following candidate profile and job listings, then recommend the top 5 most suitable jobs.

**Candidate Profile:**
- Skills: ${resumeData.skills.join(", ")}
- Years of Experience: ${resumeData.experienceYears}
- Previous Job Titles: ${resumeData.jobTitles.join(", ")}
- Education: ${resumeData.education.join(", ")}
- Recent Experience: ${resumeData.experience.slice(0, 3).join(" | ")}

**Available Jobs (${jobs.length} total):**
${jobs
  .map(
    (job, idx) => `
${idx + 1}. ID: ${job.id}
   Title: ${job.title}
   Company: ${job.company}
   Location: ${job.location} (${job.locationType})
   Type: ${job.employmentType}
   Level: ${job.experienceLevel}
   Category: ${job.category}
   Salary: ${job.salaryCurrency} ${job.salaryMin || "N/A"}-${job.salaryMax || "N/A"}
   Description: ${job.description.substring(0, 200)}...
   Requirements: ${job.requirements?.substring(0, 200) || "Not specified"}...
`,
  )
  .join("\n")}

**Task:**
Return EXACTLY 5 job recommendations in the following JSON format (no markdown, just pure JSON):
[
  {
    "jobId": "job-id-here",
    "score": 95,
    "reasoning": "One sentence explaining why this job is a great fit"
  }
]

**Scoring Criteria:**
- Score 90-100: Perfect match (skills + experience + level all align)
- Score 75-89: Strong match (most requirements met)
- Score 60-74: Good match (some requirements met, room to grow)
- Score 40-59: Moderate match (entry point or stretch role)
- Below 40: Poor match (don't recommend)

Only recommend jobs scoring 60 or above. Order by score descending.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Parse the JSON response
      const cleanedResponse = response
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const recommendations = JSON.parse(cleanedResponse);

      this.logger.log(`Generated ${recommendations.length} job recommendations`);

      return recommendations;
    } catch (error) {
      this.logger.error("Failed to analyze resume for jobs", error);
      throw new Error("Failed to generate job recommendations");
    }
  }

  async enhanceSearch(
    searchQuery: string,
    resumeData: {
      skills: string[];
      experienceYears: number;
      jobTitles: string[];
    },
    jobs: Array<{
      id: string;
      title: string;
      company: string;
      description: string;
      category: string;
    }>,
  ): Promise<{
    enhancedQuery: string;
    prioritizedJobIds: string[];
    insights: string;
  }> {
    if (!this.isAvailable()) {
      throw new Error("Gemini AI is not available");
    }

    const prompt = `
You are a smart job search assistant. The user searched for: "${searchQuery}"

**User Profile:**
- Skills: ${resumeData.skills.join(", ")}
- Experience: ${resumeData.experienceYears} years
- Recent Roles: ${resumeData.jobTitles.join(", ")}

**Search Results (${jobs.length} jobs):**
${jobs
  .map(
    (job, idx) => `
${idx + 1}. ID: ${job.id}
   Title: ${job.title}
   Company: ${job.company}
   Category: ${job.category}
   Description: ${job.description.substring(0, 150)}...
`,
  )
  .join("\n")}

**Task:**
1. Understand what the user is really looking for based on their search query
2. Prioritize the job IDs that best match BOTH the search intent AND the user's profile
3. Provide a brief insight about their search

Return EXACTLY in this JSON format (no markdown):
{
  "enhancedQuery": "A refined search query that captures the user's intent",
  "prioritizedJobIds": ["job-id-1", "job-id-2", "job-id-3", "job-id-4", "job-id-5"],
  "insights": "One sentence insight about their search and recommendations"
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      const cleanedResponse = response
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const enhancement = JSON.parse(cleanedResponse);

      this.logger.log(`Enhanced search for query: ${searchQuery}`);

      return enhancement;
    } catch (error) {
      this.logger.error("Failed to enhance search", error);
      throw new Error("Failed to enhance search results");
    }
  }

  /**
   * Parse a real resume/CV file (PDF, DOCX, image, or plain text) into a loosely-typed
   * JSON object using Gemini's multimodal capabilities. The caller is responsible
   * for mapping the result onto the strict ResumeData schema.
   */
  async parseResumeFile(file: { buffer: Buffer; mimeType: string }): Promise<Record<string, any>> {
    if (!this.isAvailable()) {
      throw new Error("Gemini AI is not available");
    }

    const prompt = `You are a precise resume parser. Read the attached resume/CV and extract its content into JSON that EXACTLY matches the schema below. Use information ONLY from the document — never invent data. Leave fields you cannot find as empty strings or empty arrays. For any "summary" field, output valid HTML: wrap bullet points in <ul><li>...</li></ul> and prose in <p>...</p>.

Return ONLY raw JSON (no markdown code fences) in this exact shape:
{
  "basics": {
    "name": "", "headline": "", "email": "", "phone": "", "location": "",
    "url": { "label": "", "href": "" }
  },
  "summary": "<p>...</p>",
  "profiles": [{ "network": "GitHub", "username": "", "url": "https://..." }],
  "experience": [{ "company": "", "position": "", "location": "", "date": "", "summary": "<ul><li>...</li></ul>", "url": "" }],
  "education": [{ "institution": "", "studyType": "", "area": "", "score": "", "date": "", "summary": "" }],
  "skills": [{ "name": "Category or skill name", "keywords": ["..."] }],
  "projects": [{ "name": "", "description": "", "date": "", "summary": "", "url": "" }],
  "certifications": [{ "name": "", "issuer": "", "date": "" }],
  "languages": [{ "name": "", "description": "proficiency level" }],
  "awards": [{ "title": "", "awarder": "", "date": "", "summary": "" }]
    }`;

    const parts: any[] = [];
    if (file.mimeType === "text/plain") {
      parts.push({ text: `${prompt}\n\nRESUME TEXT:\n${file.buffer.toString("utf8")}` });
    } else if (
      file.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const docxText = await this.extractDocxText(file.buffer);
      parts.push({ text: `${prompt}\n\nRESUME TEXT:\n${docxText}` });
    } else {
      parts.push({
        inlineData: { mimeType: file.mimeType, data: file.buffer.toString("base64") },
      });
      parts.push({ text: prompt });
    }

    try {
      const result = await this.model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig: { responseMimeType: "application/json" },
      });

      const response = result.response.text();
      const cleaned = response.replace(/```json/g, "").replace(/```/g, "").trim();

      this.logger.log("Parsed resume file via Gemini");

      return JSON.parse(cleaned);
    } catch (error) {
      this.logger.error("Failed to parse resume file", error);
      throw new Error(`Failed to parse the uploaded resume: ${this.getErrorMessage(error)}`);
    }
  }
}

