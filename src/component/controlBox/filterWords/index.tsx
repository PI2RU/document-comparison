import { Input, Select } from "antd";
import { FC, useState } from "react";
import useSWRMutation from "swr/mutation";
import { throttle } from "lodash-es";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    applyFilter(e.target.value, operator);
  };

  const handleOperatorChange = (value: string) => {
    const newOperator = value as FilterOperator;
    setOperator(newOperator);
    applyFilter(filter, newOperator);
  };

  const applyFilter = async (
    filterKeywords: string,
    filterOperator: FilterOperator
  ) => {
    const keywords = (await generateWords(filterKeywords)) as string[];
    const sentences = (await generateWords(text)) as string[];

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

  return (
    <div>
      <div>
        <Input onChange={throttle(handleChange, 1000)} value={filter}></Input>
      </div>
      <Select
        defaultValue={FilterCondition.AND}
        style={{ width: 120 }}
        onChange={handleOperatorChange}
        options={[
          { value: FilterCondition.AND, label: "AND" },
          { value: FilterCondition.OR, label: "OR" },
          { value: FilterCondition.NOT, label: "NOT" },
        ]}
      />
    </div>
  );
};
