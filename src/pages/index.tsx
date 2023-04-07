import { ContextMenu } from "@/component/contextMenu";
import { ControlBox } from "@/component/controlBox";
import { PdfViewer } from "@/component/pdfViewer";
import { SearchBox } from "@/component/searchBox";
import { BoxData } from "@/types/App";
import { MouseEvent, useEffect, useRef, useState } from "react";

import { GlobalWorkerOptions, version } from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";

export default function Home() {
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  const pdfRef = useRef<HTMLDivElement>(null);
  const pdfRef2 = useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = useState("");
  const [showSearch, setShowSearch] = useState(true);
  const [selectedText, setSelectedText] = useState("");
  const [loading, setLoading] = useState(false);

  const [boxData, setBoxData] = useState<BoxData[]>([]);

  const [summaryText, setSummaryText] = useState<{
    summary: string[];
    keywords: string[];
  }>({
    summary: [],
    keywords: [],
  });

  const getSelectedText = () => {
    const selection = window.getSelection();
    return selection ? selection.toString() : "";
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    const text = getSelectedText();

    setSelectedText(text);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuVisible(true);
  };

  const handleCloseContextMenu = () => {
    setContextMenuVisible(false);
  };

  useEffect(() => {
    GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.js`;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseContextMenu();
      }
    };

    const handleBodyClick = () => {
      handleCloseContextMenu();
    };

    document.body.addEventListener("click", handleBodyClick);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.body.removeEventListener("click", handleBodyClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const itemClick = (item: string) => {
    console.log("itemClick", item);
    if (item === "查词") {
      setShowSearch(true);
      setInputValue(selectedText);
      setLoading(true);

      setTimeout(() => {
        setBoxData([
          ...boxData,
          {
            username: "张三",
            role: "user",
            text: selectedText,
          },
        ]);
        setInputValue("");
        setLoading(false);
      }, 2000);
    }
  };

  return (
    <div>
      <ControlBox props={summaryText} />
      <div className="pdfTwo" onContextMenu={(e) => handleContextMenu(e)}>
        <PdfViewer
          pdfRef={pdfRef}
          pdfRef2={pdfRef2}
          setSummary={setSummaryText}
        />
      </div>
      <ContextMenu
        hasSelectedText={selectedText?.length > 0}
        itemClick={itemClick}
        isVisible={contextMenuVisible}
        x={contextMenuPosition.x}
        y={contextMenuPosition.y}
        onClose={handleCloseContextMenu}
      />
      <SearchBox
        loading={loading}
        boxData={boxData}
        value={inputValue}
        setValue={setInputValue}
        isVisible={showSearch}
      />
    </div>
  );
}
