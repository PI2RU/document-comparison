import { PDFPageProxy } from "pdfjs-dist";
import {
  DocumentInitParameters,
  TextContent,
  TypedArray,
} from "pdfjs-dist/types/src/display/api";
import { Layer } from "./Layer";

export type Src =
  | string
  | URL
  | TypedArray
  | ArrayBuffer
  | DocumentInitParameters;

export interface OpdfProps {
  src: Src;
  container: HTMLElement;
  shouldListenResize?: boolean;
  canvasType?: "canvas" | "svg";
}

export enum RenderType {
  ALL = "all",
  SINGLE = "single",
}

export interface OpdfStatus {
  status: Status;
  renderType: RenderType;
}

export type Status = "loading" | "loaded" | "error" | "unloaded";

export interface RenderPageProps {
  pageProxy: PDFPageProxy;
  pdfViewer: HTMLElement | null;
  layer: Layer;
  renderType: RenderType;
}

export type RenderPageMap = Map<
  number,
  {
    textContentItemsStr: string[];
    divs: HTMLElement[];
    textContent: TextContent;
  }
>;

export type MatchInfos = {
  sortId: number[];
  text: string;
};

export type MatchInfo = {
  keyword: string;
  startIndex: number;
  endIndex: number;
  divSpan?: HTMLSpanElement;
};

export type HighLightContainer = {
  dataMatchId: string;
  pageIndex: number;
  nodeResource: HTMLElement[];
};

export type MatchType =
  | Map<string, { text: string; matchText: string; regex?: RegExpExecArray }[]>
  | undefined;

export type TextDivPosition = {
  divIndex: number;
  startIndex: number;
  endIndex: number;
  divSpan?: HTMLElement;
};

export type RenderTask = {
  endTime: number;
  pageIndex: number;
  pageWrap: HTMLElement;
  textContentItemsStr: string[];
};
