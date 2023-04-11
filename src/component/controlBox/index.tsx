import { ScrollView } from "@/lib";
import { Button, Rate, Slider, Space, Tag, Tooltip } from "antd";
import { RedoOutlined } from "@ant-design/icons";

import { SliderMarks } from "antd/es/slider";
import { ChangeEvent, useEffect, useState } from "react";

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
        <SummaryBox />
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
      <Space direction="vertical">
        <span>精确度</span>
        <Rate character="A" allowHalf style={{ fontSize: 24 }} />
      </Space>
      <ColorPicker />
    </div>
  );
};

// 颜色选择器
export const ColorPicker = () => {
  const [color, setColor] = useState("");
  const [tempColors, setTempColors] = useState<string[]>([]);

  const [defaultColor, setDefaultColor] = useState("");
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const defaultColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--default_selection_color")
      .trim();
    const rgbaColor = defaultColor.match(/rgba?\(([0-9\s,.]+)\)/);
    let color = defaultColor;
    if (rgbaColor) {
      const [r, g, b, a] = rgbaColor[1].split(",").map(Number);
      const hexColor = `#${((1 << 24) + (r << 16) + (g << 8) + b)
        .toString(16)
        .slice(1)}`;
      setOpacity(a !== undefined ? a : 1);
      color = hexColor;
    }
    setColor(color);
    setDefaultColor(color);
  }, []);

  const setPageColor = (color: string) => {
    setColor(color);

    document.documentElement.style.setProperty(
      "--default_selection_color",
      color
    );
  };

  // TODO: 预留的透明度调节函数
  const handleOpacityChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOpacity(parseFloat(event.target.value));
  };

  // 处理颜色选择器值更改的函数
  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPageColor(event.target.value);
  };

  // 保存颜色值
  const saveColor = () => {
    console.log("保存颜色值", color);
    if (tempColors.length < 20) {
      setTempColors([...tempColors, color]);
    } else {
      setTempColors([...tempColors.slice(1), color]);
    }
  };

  const resetColor = () => {
    if (tempColors.length > 0) {
      tempColors.pop();
      setPageColor(tempColors[tempColors.length - 1] || defaultColor);
      setTempColors(tempColors);
    }
  };

  return (
    <span className="flex justify-center align-middle">
      <span className="mr-2">色彩</span>
      <Space>
        <input
          type="color"
          value={color}
          onChange={handleColorChange}
          onBlur={saveColor}
          className={styles.colorInput}
        />
        <span>
          <RedoOutlined onClick={resetColor} />
        </span>
      </Space>
    </span>
  );
};
