import { ScrollView } from "@/lib";
import { Button, Slider, Space, Tag, Tooltip } from "antd";
import { SliderMarks } from "antd/es/slider";
import { ChangeEvent, useState } from "react";

import styles from "./index.module.scss";

const bgColors = {
  word: "#f0f8ff",
  correct: "#e0ffff",
  associate: "#e6e6fa",
  ask: "#fffacd",
  summary: "#f5f5f5",
};

export const ControlBox = ({
  props,
}: {
  props: {
    summary: string[];
    keywords: string[];
    uniqueId: string;
  };
}) => {
  return (
    <div className={styles.controlBox}>
      <h5 className={styles.boxTitle}>控制面板</h5>
      <div>
        <div className="flex justify-between align-middle">
          <SummaryBox />
          <ColorPicker />
        </div>
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
          <div className="flex flex-wrap justify-start align-middle">
            {props?.keywords?.map((item, index) => {
              return (
                <Tag
                  bordered={false}
                  className="mb-2 cursor-pointer"
                  color="magenta"
                  onClick={() => {
                    ScrollView({
                      to: `${item}_${props.uniqueId}_${index}`,
                    });
                  }}
                  key={index}
                >
                  {item}
                </Tag>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const marks: SliderMarks = {
  20: "宽松",
  60: "精确",
  100: "严格",
};

export const SummaryBox = () => {
  return (
    <div className={styles.summaryBox}>
      <div>精确度</div>
      <Slider
        style={{
          backgroundColor: bgColors.word,
        }}
        marks={marks}
        defaultValue={60}
        max={100}
        min={20}
        step={20}
      />
    </div>
  );
};

// 颜色选择器
export const ColorPicker = () => {
  const [color, setColor] = useState("#ff0000");
  const [tempColors, setTempColors] = useState<string[]>([]);

  const setPageColor = (color: string) => {
    setColor(color);

    document.documentElement.style.setProperty(
      "--default_selection_color",
      color
    );
  };

  // 处理颜色选择器值更改的函数
  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (tempColors.length < 20) {
      setTempColors([...tempColors, color]);
    } else {
      setTempColors([...tempColors.slice(1), color]);
    }

    setPageColor(event.target.value);
  };

  const resetColor = () => {
    if (tempColors.length > 0) {
      const lastColor = tempColors.pop();
      setTempColors(tempColors);
      setPageColor(lastColor!);
    }
  };

  return (
    <div className={styles.colorPickerContainer}>
      <div>关键词颜色</div>
      <Space>
        <input
          type="color"
          value={color}
          onChange={handleColorChange}
          className={styles.colorInput}
        />
        <Button onClick={resetColor} size="small">
          撤回
        </Button>
      </Space>
    </div>
  );
};
