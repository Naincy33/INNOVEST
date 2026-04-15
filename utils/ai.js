import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "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", // ⚠️ yaha apni key daal
});

export const generateIdea = async () => {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content:
          "Give me 1 startup idea with title, problem and solution",
      },
    ],
  });

  return res.choices[0].message.content;
};