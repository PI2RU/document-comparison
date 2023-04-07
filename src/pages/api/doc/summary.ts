import { summaryPrompt } from "@/prompt/summary";
import { cleanedStrToParse, cleanedString } from "@/utils";
import { PromptTemplate } from "langchain";
import { LLMChain } from "langchain/chains";
import { OpenAI } from "langchain/llms";
import type { NextApiRequest, NextApiResponse } from "next";

export const getSummarizationChain = async (text: string) => {
  const model = new OpenAI({
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxTokens: 1500,
  });

  const { template, inputVariables } = summaryPrompt;

  const prompt = new PromptTemplate({
    template,
    inputVariables,
  });

  const chain = new LLMChain({
    llm: model,
    prompt,
  });

  const props = {
    text,
    keywordLength: 5,
  };

  const res = await chain.call(props);

  return cleanedStrToParse(res.text || "");
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const reqText = req.body;

    if (!reqText) {
      res.status(400).json({
        error: "text is required",
      });
      return;
    } else {
      const { summary, keywords } = await getSummarizationChain(reqText);

      res.status(200).json({
        summary: [summary],
        keywords,
      });
    }
  }
}
