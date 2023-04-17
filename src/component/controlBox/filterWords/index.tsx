import { Input, Select, Space } from "antd";
import { FC, useState } from "react";
import useSWRMutation from "swr/mutation";

export enum FilterCondition {
  AND = "AND",
  OR = "OR",
  NOT = "NOT",
}

type FilterOperator = "AND" | "OR" | "NOT";

interface KeywordFilterProps {
  text: string;
  onFilter: (filteredText: string) => void;
}

async function generateWordsPost(url: string, { arg }: { arg: string }) {
  return fetch(url, {
    method: "POST",
    body: arg,
  }).then((res) => res.json());
}

export const FilterWord: FC<KeywordFilterProps> = ({ onFilter, text }) => {
  const [filter, setFilter] = useState("");
  const [operator, setOperator] = useState<FilterOperator>("AND");

  const { trigger: generateWords, isMutating } = useSWRMutation(
    "/api/utils/words",
    generateWordsPost
  );

  const applyFilter = async (
    filterKeywords: string,
    filterOperator: FilterOperator
  ) => {
    console.log("filterKeywords --->", filterKeywords);

    const keywords = (await generateWords(filterKeywords))?.result as string[];
    const sentences = (await generateWords(text))?.result as string[];

    console.log("sentences --->", sentences, keywords);

    if (filterKeywords === "") {
      onFilter(text);
      return;
    }

    const filteredSentences = sentences.filter((sentence) => {
      const words = sentence.toLowerCase().split(" ");

      switch (filterOperator) {
        case "AND":
          return keywords.every((keyword) => words.includes(keyword));
        case "OR":
          return keywords.some((keyword) => words.includes(keyword));
        case "NOT":
          return !keywords.some((keyword) => words.includes(keyword));
      }
    });

    onFilter(filteredSentences.join(". "));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const handleBlur = async (e: React.ChangeEvent<HTMLInputElement>) => {
    applyFilter(e.target.value, operator);
  };
  const handleOperatorChange = (value: string) => {
    const newOperator = value as FilterOperator;
    setOperator(newOperator);
    applyFilter(filter, newOperator);
  };

  return (
    <Space>
      <Select
        defaultValue={FilterCondition.AND}
        style={{ width: 120 }}
        onChange={handleOperatorChange}
        options={[
          { value: FilterCondition.AND, label: "包含" },
          { value: FilterCondition.OR, label: "包含任一" },
          { value: FilterCondition.NOT, label: "不包含" },
        ]}
      />
      <Input onChange={handleInputChange} onBlur={handleBlur} value={filter} />
    </Space>
  );
};
