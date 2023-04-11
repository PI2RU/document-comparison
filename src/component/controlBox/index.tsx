import { Divider, Space, Tag, Tooltip } from "antd";
import { ScrollView } from "@/lib";

import { SummaryBox } from "./summaryBox";
import { FilterWord } from "./filterWords";

import styles from "./index.module.scss";
import { useState } from "react";

export const ControlBox = ({
  props,
}: {
  props: {
    summary: string[];
    keywords: string[];
    uniqueId: string;
  };
}) => {
  const text =
    "这是一个示例文本. 我们将使用关键词过滤器对其进行过滤. 您可以根据需要添加多个关键词。";

  const [filteredText, setFilteredText] = useState(text);

  const handleFilter = (newFilteredText: string) => {
    setFilteredText(newFilteredText);
  };

  return (
    <div className={styles.controlBox}>
      <h5 className={styles.boxTitle}>控制面板</h5>
      <div>
        <SummaryBox />
        <Divider />
        <div>
          <div>
            {props?.summary?.map((item, index) => {
              return (
                <Tooltip
                  key={index}
                  title={item}
                  color={"#333"}
                  placement="bottomLeft"
                >
                  <div className={`${styles.boxItem} bg-slate-50 `}>
                    <span
                      className={`${styles.summary} line-clamp-4 font-bold`}
                    >
                      {item}
                    </span>
                  </div>
                </Tooltip>
              );
            })}
          </div>
          <Divider />
          <div className="flex flex-wrap justify-start align-middle">
            {props?.keywords?.map((item, index) => {
              return (
                <Tag
                  bordered={false}
                  className="mb-2 cursor-pointer"
                  color="magenta"
                  onClick={() => {
                    ScrollView({
                      to: `${item}_${props.uniqueId}_1`,
                    });
                  }}
                  key={index}
                >
                  {item}
                </Tag>
              );
            })}
          </div>
          <Divider />
          <Space direction="vertical">
            <span>过滤词：</span>
            <span className="text-xs text-slate-600">{filteredText}</span>
            <FilterWord text={text} onFilter={handleFilter} />
          </Space>
        </div>
      </div>
    </div>
  );
};
