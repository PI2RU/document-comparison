import { TextItem } from "pdfjs-dist/types/src/display/api";
import { getLinkId } from "./Common";
import {
  HighLightContainer,
  MatchInfo,
  MatchInfos,
  MatchType,
  RenderPageMap,
  TextDivPosition,
} from "./Types";

/**
 * 搜索和高亮的, 辅助RenderPage类功能
 */
export class Search {
  private _pageContent: Map<number, string> = new Map();
  private _matchReg: RegExp | null = null;
  private _matchStrArr: MatchInfos[] = [];
  public uniqueId = "";
  public highLightContainers: HighLightContainer[] = [];
  public matchMap: MatchType = new Map();
  public textDivPositions: Map<number, TextDivPosition[]> = new Map();
  constructor({
    search,
    pageQuery,
    preMatch,
    uniqueId,
  }: {
    search: MatchInfos[];
    pageQuery?: number;
    preMatch?: boolean;
    uniqueId: string;
  }) {
    this._matchStrArr = search;
    console.log("search -->", search, pageQuery, preMatch, uniqueId);

    this.uniqueId = uniqueId;

    if (pageQuery) {
      // TODO: search in page or all
    }

    if (preMatch) {
      this._matchReg = new RegExp(
        this._matchStrArr
          .map((item) => item.text.replace(/[\n\r\t]/g, ""))
          .join("|"),
        "gum"
      );
    }
  }

  init(pageDataMap?: RenderPageMap) {
    console.log("init search", pageDataMap);
    if (pageDataMap) {
      this.initPageContent(pageDataMap);
    } else {
      console.error("pageDataMap is undefined");
    }
  }

  private initPageContent(pageDataMap: RenderPageMap) {
    const pageDataMapValues = Array.from(pageDataMap.values());
    const pageDataKeys = Array.from(pageDataMap.keys());

    pageDataMapValues.forEach((pageData, index) => {
      const pageIndex = pageDataKeys[index];
      const divs = pageData.divs;
      const content = this.processTextContent(pageData, pageIndex, divs);

      this._pageContent.set(pageIndex, content);
      this.matchAndHighlight(divs, content, pageIndex);
    });
  }

  private processTextContent(
    pageData: any,
    pageIndex: number,
    divs: HTMLElement[]
  ) {
    return (pageData.textContent.items as TextItem[]).reduce(
      (prev, item, index) => {
        const text = prev + (item as TextItem)?.str;

        //  处理文本,用于page全局匹配
        const divSpan = divs?.[index];

        // if (pageIndex === 1) {
        // console.log("divSpan", divSpan, pageIndex, index, "\n");
        // }

        const pageInfo = this.textDivPositions?.get(pageIndex);
        const lastDiv = pageInfo?.[pageInfo.length - 1];

        const startIndex = lastDiv?.endIndex ? lastDiv?.endIndex : 0;
        const endIndex = startIndex + (divSpan.textContent?.length || 0);

        if (pageInfo) {
          pageInfo.push({
            divIndex: index,
            startIndex,
            endIndex,
            divSpan,
          });
        } else {
          this.textDivPositions.set(pageIndex, [
            {
              divIndex: index,
              startIndex,
              endIndex,
              divSpan,
            },
          ]);
        }
        return text;
      },
      ""
    );
  }

  private createMatchInfo(matchReg: RegExpExecArray): MatchInfo {
    return {
      keyword: matchReg[0],
      startIndex: matchReg.index,
      endIndex: matchReg.index + matchReg[0].length,
    };
  }

  private matchAndHighlight(
    divs: HTMLElement[],
    content: string,
    pageIndex: number
  ) {
    let matchReg: RegExpExecArray | null | undefined = null;
    const matchInfos: MatchInfo[] = [];

    while ((matchReg = this._matchReg?.exec(content)) !== null) {
      if (matchReg) {
        const matchInfo = this.createMatchInfo(matchReg);
        matchInfos.push(matchInfo);

        if (divs) {
          this.processMatchItems(divs, pageIndex, matchInfo);
        }
      }
    }
  }

  private processMatchItems(
    divs: HTMLElement[],
    pageIndex: number,
    matchInfo: MatchInfo
  ) {
    const matchItem = this.matchMap?.get(matchInfo.keyword);
    let matchItemIndex: number;

    if (matchItem) {
      matchItem.push({
        text: matchInfo.keyword,
        matchText: "",
      });
      matchItemIndex = matchItem.length;
    } else {
      this.matchMap?.set(matchInfo.keyword, [
        {
          text: matchInfo.keyword,
          matchText: "",
        },
      ]);
      matchItemIndex = 1;
    }

    const highlight: HighLightContainer = {
      dataMatchId: "",
      pageIndex,
      nodeResource: [],
    };

    const textDivPosition = this.textDivPositions?.get(pageIndex);
    this.filterAndProcessMatchData(
      textDivPosition,
      matchInfo,
      matchItemIndex,
      pageIndex,
      highlight
    );
    this.highLightContainers.push(highlight);
  }

  private filterAndProcessMatchData(
    textDivPosition: TextDivPosition[] | undefined,
    matchInfo: MatchInfo,
    matchItemIndex: number,
    pageIndex: number,
    highlight: HighLightContainer
  ) {
    textDivPosition?.filter((item) => {
      const [flag, startOffset, endOffset] = this.checkMatchConditions(
        item,
        matchInfo
      );

      if (flag && item.divSpan) {
        const matchData = this.getMatchData(
          item.divSpan,
          matchInfo,
          [startOffset, endOffset],
          matchItemIndex,
          pageIndex
        );

        if (matchData?.dataMatchId) {
          highlight.dataMatchId = matchData?.dataMatchId;
        }
        if (matchData?.nodeResource) {
          highlight.nodeResource.push(matchData.nodeResource);
        }
      }

      return flag;
    });
  }

  private checkMatchConditions(
    item: TextDivPosition,
    matchInfo: MatchInfo
  ): [boolean, number, number] {
    let flag: boolean;
    let startOffset = 0;
    let endOffset = 0;

    const itemStartIndex = item.startIndex;
    const itemEndIndex = item.endIndex;

    const matchStartIndex = Math.min(matchInfo.startIndex, matchInfo.endIndex);
    const matchEndIndex = Math.max(matchInfo.startIndex, matchInfo.endIndex);

    if (itemStartIndex <= matchStartIndex && itemEndIndex >= matchEndIndex) {
      flag = true;
      startOffset = matchStartIndex - itemStartIndex;
      endOffset = matchEndIndex - itemStartIndex;
    } else if (
      itemStartIndex >= matchStartIndex &&
      itemEndIndex <= matchEndIndex
    ) {
      flag = true;
      startOffset = 0;
      endOffset = itemEndIndex - itemStartIndex;
    } else if (
      itemStartIndex <= matchStartIndex &&
      itemEndIndex >= matchStartIndex &&
      itemEndIndex <= matchEndIndex
    ) {
      flag = true;
      startOffset = matchStartIndex - itemStartIndex;
      endOffset = itemEndIndex - itemStartIndex;
    } else if (
      itemStartIndex >= matchStartIndex &&
      itemStartIndex <= matchEndIndex &&
      itemEndIndex >= matchEndIndex
    ) {
      flag = true;
      startOffset = 0;
      endOffset = matchEndIndex - itemStartIndex;
    } else {
      flag = false;
    }

    return [flag, startOffset, endOffset];
  }

  private getMatchData(
    textDiv: HTMLElement,
    matchInfo: MatchInfo,
    pos: [number, number],
    matchItemIndex: number,
    pageIndex: number
  ) {
    const matchText = textDiv?.textContent?.substring(pos[0], pos[1]);

    if (matchText) {
      const linkId = getLinkId(matchInfo.keyword);
      const dataMatchId = `data-match-super-${linkId}_${this.uniqueId}_${matchItemIndex}`;

      const beforeTextNode = document.createTextNode(
        textDiv.textContent?.substring(0, pos[0]) || ""
      );
      const afterTextNode = document.createTextNode(
        textDiv.textContent?.substring(pos[1]) || ""
      );

      const span = document.createElement("span");

      span.setAttribute("role", "presentation");
      span.setAttribute("dir", "ltr");

      span.textContent = matchText;

      textDiv.innerHTML = "";
      textDiv.appendChild(beforeTextNode);
      textDiv.appendChild(span);
      textDiv.appendChild(afterTextNode);

      return {
        pageIndex,
        nodeResource: span,
        dataMatchId,
      };
    }
  }
}
