import { Module } from "@nestjs/common";

import { GeminiModule } from "../gemini/gemini.module";
import { ResumeModule } from "../resume/resume.module";
import { JobController } from "./job.controller";
import { JobService } from "./job.service";

@Module({
  imports: [GeminiModule, ResumeModule],
  controllers: [JobController],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}

