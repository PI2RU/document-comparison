import { Space, Rate } from "antd";
import { ColorPicker } from "../colorPicker";
import styles from "./index.module.scss";

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
