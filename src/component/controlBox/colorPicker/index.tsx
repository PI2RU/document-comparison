import { RedoOutlined } from "@ant-design/icons";
import { Space } from "antd";
import { useState, useEffect, ChangeEvent } from "react";
import styles from "./index.module.scss";

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
