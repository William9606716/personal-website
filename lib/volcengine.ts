import OpenAI from "openai";

let _volc: OpenAI | null = null;

export function getVolcClient(): OpenAI {
  if (!_volc) {
    _volc = new OpenAI({
      apiKey: process.env.VOLC_API_KEY ?? "placeholder",
      baseURL: process.env.VOLC_BASE_URL,
    });
  }
  return _volc;
}
