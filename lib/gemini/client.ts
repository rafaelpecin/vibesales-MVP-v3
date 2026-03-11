import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";
import { createLogger } from "@/lib/logger";
import type { SeoResult } from "@/lib/gemini/seoPrompt";
import type { AdsResult } from "@/lib/gemini/adsPrompt";

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
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
    logger.console.error({ raw: cleaned}, "Gemini full response");
    logger.error({ err, raw: cleaned.slice(0, 500) }, "Failed to parse Gemini JSON response");
    throw new Error("Invalid JSON returned by Gemini");
  }

  return parsed;
}

export async function callGeminiForAds(prompt: string): Promise<AdsResult> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  logger.info("Gemini ads call start");
  const start = Date.now();

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const duration = Date.now() - start;
  logger.info({ duration_ms: duration }, "Gemini ads call complete");

  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsed: AdsResult;
  try {
    parsed = JSON.parse(cleaned) as AdsResult;
  } catch (err) {
    logger.error({ err, raw: cleaned.slice(0, 500) }, "Failed to parse Gemini ads JSON response");
    throw new Error("Invalid JSON returned by Gemini");
  }

  if (
    !Array.isArray(parsed) ||
    parsed.length !== 4 ||
    !parsed.every((arr) => Array.isArray(arr) && arr.length === 10)
  ) {
    logger.error({ shape: parsed }, "Gemini ads response does not match expected shape");
    throw new Error("Gemini ads response shape invalid");
  }

  return parsed;
}

/**
 * Low-level helper: calls Gemini and returns the parsed JSON response.
 * Useful for one-off prompts that don't fit the SEO or Ads schemas.
 */
export async function callGeminiJson<T = unknown>(prompt: string): Promise<T> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  return JSON.parse(cleaned) as T;
}
