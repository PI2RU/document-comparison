import { HighLightContainer, RenderTask } from "./Types";

export class Scroll {
  private _highLightContainer: HighLightContainer[] = [];
  // TODO: 处理位置信息
  private areaDiv: Map<
    number,
    {
      pageIndex: number;
      top: number;
      left: number;
      right: number;
      width: number;
      height: number;
      divRight: number;
      matchId: string;
    }
  > = new Map();
  private selection: Map<
    number,
    {
      pageIndex: number;
      top: number;
      left: number;
      width: number;
      height: number;
      right: number;
      matchId: string;
    }[]
  > = new Map();
  private parentToIndex = new Map();

  constructor(highLightContainer: HighLightContainer[]) {
    this._highLightContainer = highLightContainer;
  }

  addScroll(task: RenderTask[]) {
    // TODO: 实验性的高亮功能
    this._highLightContainer?.forEach((item, index) => {
      const parent = task?.find(
        (result) => item?.pageIndex === result?.pageIndex
      )?.pageWrap;

      const currentMatchIdv = item;

      if (currentMatchIdv?.nodeResource && parent) {
        this.parentToIndex.set(item.pageIndex, parent);
      }

      if (item.nodeResource?.length) {
        const allRects = item.nodeResource.map((node) => {
          const range = node.ownerDocument.createRange();

          range.selectNodeContents(node);
          const selection = window.getSelection();

          selection?.removeAllRanges(); // 清除原有的选区
          selection?.addRange(range); // 设置新的选区

          const clientRects = Array.from(range.getClientRects());

          const pageRect = parent?.getBoundingClientRect() || {
            top: 0,
            left: 0,
            width: 0,
            height: 0,
          };

          return clientRects
            .filter((clientRect) => {
              return (
                clientRect.width > 0 &&
                clientRect.height > 0 &&
                clientRect.width < pageRect.width &&
                clientRect.height < pageRect.height
              );
            })
            .map((clientRect) => ({
              right: clientRect.right,
              top: clientRect.top + node.scrollTop - pageRect.top,
              left: clientRect.left + node.scrollLeft - pageRect.left,
              width: clientRect.width,
              height: clientRect.height,
              matchId: currentMatchIdv.dataMatchId,
              pageIndex: item.pageIndex,
            }));
        });

        const flatAllRects = allRects.flat();

        if (flatAllRects?.length) {
          if (this.selection.has(index)) {
            this.selection.get(index)?.push(...flatAllRects);
          } else {
            this.selection.set(index, flatAllRects);
          }
        }
      }
    });

    // TODO: 关于高亮的位置是否是P 的开头还是结尾还是中间, 会1px - 3px的偏差
    this.selection.forEach((item) => {
      item.forEach((rect) => {
        if (this.areaDiv.get(rect.top)) {
          const currentRect = this.areaDiv.get(rect.top);
          if (currentRect) {
            currentRect.divRight = rect.left + rect.width;
          }
        } else {
          this.areaDiv.set(rect.top, {
            ...rect,
            divRight: rect.left + rect.width,
          });
        }
      });
    });

    this.areaDiv.forEach((item) => {
      const div = document.createElement("div");
      div.style.top = `${item.top}px`;
      div.style.left = `${item.left}px`;

      div.style.width = `${item.divRight - item.left}px`;
      div.style.height = `${item.height}px`;

      div.classList.add("highlight_area");
      div.classList.add("default_match_highlight");
      div.classList.add("matching_highlight");
      div.setAttribute("data-match-id", item.matchId);

      const parent = this.parentToIndex.get(item.pageIndex);
      if (parent) {
        const highlightWrap = parent.getElementsByClassName("highlight_wrap");
        for (let i = 0; i < highlightWrap.length; i++) {
          highlightWrap[i].remove();
        }

        parent.appendChild(div);
      }
    });
  }
}
