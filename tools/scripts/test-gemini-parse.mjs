// Reproduce the server's Gemini CV-parse call outside Nest to isolate API errors.
import fs from "node:fs";

import { GoogleGenerativeAI } from "@google/generative-ai";

const env = fs.readFileSync(".env", "utf8");
const key = /GEMINI_API_KEY=(.*)/.exec(env)?.[1]?.trim();
const modelName = /GEMINI_MODEL=(.*)/.exec(env)?.[1]?.trim() || "gemini-2.0-flash";
console.log("model:", modelName, "| key:", key ? key.slice(0, 8) + "…" : "MISSING");

const genAI = new GoogleGenerativeAI(key);
const model = genAI.getGenerativeModel({ model: modelName });

const pdf = fs.readFileSync("OLIYAD_BEKELE_FlowCV_Resume_2026-05-11 (4).pdf");
const prompt = "Extract the person's name and email from this resume as JSON: {\"name\":\"\",\"email\":\"\"}";

try {
  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: "application/pdf", data: pdf.toString("base64") } },
          { text: prompt },
        ],
      },
    ],
    generationConfig: { responseMimeType: "application/json" },
  });
  console.log("OK:", result.response.text().slice(0, 200));
} catch (error) {
  console.log("GEMINI ERROR:", error.message?.slice(0, 500));
}
