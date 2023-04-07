import { OpenAI, PromptTemplate } from "langchain";
import { CommaSeparatedListOutputParser } from "langchain/output_parsers";

export const summaryPrompt = {
  template: `
请根据原文{text}生成一个JSON格式的摘要和关键词数组。关键词数组长度为{keywordLength}。JSON对象应包含以下两个字段：

1. summary（摘要）
2. keywords（关键词数组）

示例格式：
(
    "summary": "文本摘要",
    "keywords": ["关键词1", "关键词2", "关键词3"]
)
    `,
  inputVariables: ["text", "keywordLength"],
};

// TODO: 测试 - 需要返回的中文摘要带有关键词数组
export const keywordsPrompt = {
  template: ``,
  inputVariables: ["text", "length", "keywords"],
  parse: async (model: OpenAI, num?: number) => {
    const parser = new CommaSeparatedListOutputParser();
    const formatInstructions = parser.getFormatInstructions();

    const prompt = new PromptTemplate({
      template: `List {number} keywords.\n{format_instructions}`,
      inputVariables: ["number"],
      partialVariables: { format_instructions: formatInstructions },
    });

    const input = await prompt.format({ number: num || 10 });
    return parser.parse(await model.call(input));
  },
};
