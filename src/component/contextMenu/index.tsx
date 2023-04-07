import React from "react";
import styles from "./index.module.scss";

interface ContextMenuProps {
  isVisible: boolean;
  x: number;
  y: number;
  onClose: () => void;
  hasSelectedText: boolean;
  itemClick: (item: string) => void;
}

const selectRightMenu = [
  {
    key: "word",
    name: "查词",
  },
  {
    key: "correct",
    name: "纠错",
  },
  {
    key: "associate",
    name: "关联",
  },
  {
    key: "ask",
    name: "询问",
  },
];

const defaultRightMenu = [
  {
    name: "生成摘要",
    key: "summary",
  },
  {
    name: "文书对比",
    key: "compare",
  },
];

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isVisible,
  x,
  y,
  onClose,
  itemClick,
  hasSelectedText,
}) => {
  if (!isVisible) {
    return null;
  }

  const style = {
    left: x,
    top: y,
  };

  const menu = hasSelectedText ? selectRightMenu : defaultRightMenu;

  return (
    <div className={styles.contextMenu} style={style}>
      <ul
        onClick={(e) => {
          e.stopPropagation();
          const key = (e.target as HTMLElement).innerText;
          if (key) {
            itemClick(key);
          } else {
            console.error("key is undefined");
          }
        }}
      >
        {menu.map((item) => {
          return (
            <li onClick={onClose} key={item.key}>
              {item.name}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
