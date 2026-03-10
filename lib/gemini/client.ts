import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";
import { createLogger } from "@/lib/logger";
import type { SeoResult } from "@/lib/gemini/seoPrompt";

const logger = createLogger("lib/gemini/client");

let _genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return _genAI;
}

export async function callGeminiForSeo(prompt: string): Promise<SeoResult> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  logger.info("Gemini call start");
  const start = Date.now();

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const duration = Date.now() - start;
  logger.info({ duration_ms: duration }, "Gemini call complete");

  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsed: SeoResult;
  try {
    parsed = JSON.parse(cleaned) as SeoResult;
    logger.info(
      {
        current_score: parsed.current_score[0],
        projected_score: parsed.projected_score[0],
        suggestions_count: parsed.suggestions.length,
        keywords_count: parsed.keywords.length,
      },
      "Gemini response parsed",
    );
  } catch (err) {
    logger.error({ err, raw: cleaned.slice(0, 500) }, "Failed to parse Gemini JSON response");
    throw new Error("Invalid JSON returned by Gemini");
  }

  return parsed;
}
