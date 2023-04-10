import { HighLightContainer, RenderTask } from "./Types";

export class Scroll {
  private _highLightContainer: HighLightContainer[] = [];
  private _parentToIndex = new Map<number, HTMLElement>();

  constructor(highLightContainers: HighLightContainer[]) {
    this._highLightContainer = highLightContainers;
  }

  addScroll(tasks: RenderTask[]) {
    this._highLightContainer?.forEach((item) => {
      const parent = tasks?.find(
        (result) => item?.pageIndex === result?.pageIndex
      )?.pageWrap;

      if (!item.nodeResource || !parent) return;

      this._parentToIndex.set(item.pageIndex, parent);

      item.nodeResource.forEach((node) => {
        const range = node.ownerDocument.createRange();
        range.selectNodeContents(node);

        const selection = window.getSelection();
        // 清除原有的选区
        selection?.removeAllRanges();
        // 设置新的选区
        selection?.addRange(range);

        const pageRect = parent?.getBoundingClientRect() || {
          top: 0,
          left: 0,
          width: 0,
          height: 0,
        };

        Array.from(range.getClientRects())
          .filter((clientRect) => {
            return (
              clientRect.width > 0 &&
              clientRect.height > 0 &&
              clientRect.width < pageRect.width &&
              clientRect.height < pageRect.height
            );
          })
          .forEach((clientRect) => {
            const div = document.createElement("div");
            div.style.top = `${
              clientRect.top + node.scrollTop - pageRect.top
            }px`;
            div.style.left = `${
              clientRect.left + node.scrollLeft - pageRect.left
            }px`;

            div.style.width = `${clientRect.width}px`;
            div.style.height = `${clientRect.height}px`;

            div.classList.add(
              "highlight_area",
              "default_match_highlight",
              "matching_highlight"
            );
            div.setAttribute("data-match-id", item.dataMatchId);

            parent.appendChild(div);
          });
      });
    });
  }
}
