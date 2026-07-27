import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const InputSchema = z.object({
  prompt: z.string().min(1).max(4000),
  mode: z.enum(["generate", "improve"]).default("generate"),
});

const SYSTEM_GENERATE = `You are the HN-AI mentor: a warm, sharp AI teacher for learners who study 10 minutes a day.
Answer clearly and concretely. Prefer short numbered bullets. Include one real example.
Reply in the same language the user wrote in (Arabic answers in Arabic).`;

const SYSTEM_IMPROVE = `You are a prompt engineering expert. Rewrite the user's prompt using the CRISP framework
([Context], [Role], [Instruction], [Specifics], [Polish]). Output ONLY the improved prompt, no commentary.
Keep it in the same language as the user's prompt.`;

export const runAI = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.gemini ?? process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing Gemini API key");
    }

    const system = data.mode === "improve" ? SYSTEM_IMPROVE : SYSTEM_GENERATE;

    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: data.prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 1024 },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("تم تجاوز حد الاستخدام مؤقتًا. حاول بعد قليل.");
      throw new Error(`Gemini request failed [${res.status}]: ${body.slice(0, 400)}`);
    }

    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const text =
      json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() ?? "";

    if (!text) throw new Error("لم يصل أي رد من النموذج. جرّب صياغة أخرى.");

    return { text };
  });
