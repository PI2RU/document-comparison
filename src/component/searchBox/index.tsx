import { SendOutlined, LoadingOutlined } from "@ant-design/icons";
import { Input, Tooltip } from "antd";
import { FC, useEffect } from "react";
import styles from "./index.module.scss";
import { BoxData } from "../../types/App";

interface SearchBoxProps {
  isVisible: boolean;
  value: string;
  boxData: BoxData[];
  setValue: (value: string) => void;
  loading: boolean;
}

export const SearchBox: FC<SearchBoxProps> = ({
  isVisible,
  value,
  setValue,
  boxData,
  loading,
}) => {
  useEffect(() => {
    console.log("boxData", boxData);
    // TODO: 和OPENAI API对接
  }, [boxData]);

  if (!isVisible) {
    return null;
  }
  return (
    <div className={styles.box}>
      <h5 className={styles.boxTitle}>交互记录</h5>
      {boxData.map((item, index) => {
        return (
          <div className={styles.item} key={index}>
            <div
              className={
                item.role === "user" ? styles.leftItem : styles.rightItem
              }
            >
              <span className={styles.username}>{item.username}</span>
              {item?.text?.trim().length > 32 ? (
                <Tooltip title={item.text} placement={"bottomRight"}>
                  <span className={styles.text}>
                    {item.text.slice(0, 64) + "..."}
                  </span>
                </Tooltip>
              ) : (
                <span className={styles.text}>{item.text}</span>
              )}
            </div>
          </div>
        );
      })}

      <Input
        placeholder="input search loading default"
        value={value}
        disabled={loading}
        onChange={(e) => setValue(e.target.value)}
        onPressEnter={() => {
          console.log("enter", value);
        }}
        className={styles.input}
        suffix={loading ? <LoadingOutlined /> : <SendOutlined />}
      />
    </div>
  );
};
