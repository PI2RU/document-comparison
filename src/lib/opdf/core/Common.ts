import { PDFPageProxy } from "pdfjs-dist";

export const updateScale = (
  page: PDFPageProxy,
  ele?: HTMLElement | null,
  scaleRate?: number
) => {
  if (ele) {
    const containerWidth = ele.clientWidth * (scaleRate || 1);
    return containerWidth / page.view[2];
  }
  return 1;
};

export function isPortraitOrientation(size: { width: number; height: number }) {
  return size.width <= size.height;
}

export function getMinimumFontSize() {
  const div = document.createElement("div");
  div.style.fontSize = "1px";
  document.body.appendChild(div);
  const fontSize = parseFloat(window.getComputedStyle(div).fontSize || "0");
  document.body.removeChild(div);
  return fontSize;
}

export const getLinkId = (text: string) => {
  return text
    .trim()
    .replace(/[\n\t\r]/g, "")
    .split(" ")
    .join("-");
};

export function setScaleFactor(scale: number, pdfViewer: HTMLElement | null) {
  pdfViewer?.style.setProperty("--scale-factor", scale.toString());
}
