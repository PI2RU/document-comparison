import { debounce } from "lodash-es";
import {
  createPromiseCapability,
  getDocument,
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  PDFPageProxy,
} from "pdfjs-dist";

import {
  Layer,
  MatchInfos,
  OpdfProps,
  OpdfStatus,
  RenderPageTask,
  RenderTask,
  RenderType,
  Scroll,
  Search,
} from "./core";

/**
 * 先Init, 拿到Init后的实例, 再Render
 */
export class OPdf {
  private _loadingTask: PDFDocumentLoadingTask | undefined;
  private _pdfDocument: PDFDocumentProxy | undefined;
  private readonly _container: HTMLElement;
  private readonly _shouldListenResize: boolean = false;
  private _frameId: number | null = null;
  private _firstRender = true;
  private _containerLastStyle = {
    width: 0,
    height: 0,
  };
  public task: RenderPageTask | undefined;
  public canvasType = "canvas";
  public pageNum = 0;
  public layer: Layer | undefined;
  public opdfStatus: OpdfStatus = {
    status: "unloaded",
    renderType: RenderType.ALL,
  };

  constructor({ src, container, shouldListenResize, canvasType }: OpdfProps) {
    this._loadingTask = getDocument(src);
    this._container = container;
    this._shouldListenResize = !!shouldListenResize;
    this.canvasType = canvasType || "canvas";
  }

  // 初始化
  async init() {
    const pdfDocument = await this._loadingTask?.promise;
    if (pdfDocument) {
      this._pdfDocument = pdfDocument;
      this.pageNum = pdfDocument.numPages;
    }

    this.layer = new Layer({
      container: this._container,
    });

    this.task = new RenderPageTask({
      layer: this.layer,
    });

    return this;
  }

  // 页面主要渲染逻辑
  public async render({
    type = RenderType.ALL,
    pageNum,
  }: {
    type?: RenderType;
    pageNum?: number;
  } = {}): Promise<{
    time: number;
    text: string;
    generateHightLight: (data: MatchInfos[], uniqueId: string) => void;
  }> {
    const that = this;
    if (process.env.NODE_ENV === "development") {
      console.log("render start", new Date().getTime());
    }

    that.opdfStatus.status = "loading";

    const pageProxyPromises: Promise<PDFPageProxy>[] = [];
    const pageRenderPromise: Promise<RenderTask>[] = [];

    that.opdfStatus.renderType = type;

    if (type === "all") {
      for (let pageIndex = 1; pageIndex <= this.pageNum; pageIndex++) {
        const capability = createPromiseCapability();
        pageProxyPromises.push(capability.promise);

        this.getPageProxy(pageIndex)?.then((pageProxy) => {
          const renderPromise = createPromiseCapability();
          pageRenderPromise.push(renderPromise.promise);

          this.task
            ?.render({
              pageProxy,
              pdfViewer: this._container,
              pageIndex,
            })
            .then((result) => {
              renderPromise.resolve(result);
            })
            .catch((err) => {
              console.error(err);
              renderPromise.reject(err);
            });

          capability.resolve(pageProxy);
        });
      }
    } else if (type === "single") {
      if (pageNum) {
        const capability = createPromiseCapability();
        pageProxyPromises.push(capability.promise);

        this.getPageProxy(pageNum)?.then((result) => {
          const renderPromise = createPromiseCapability();
          pageRenderPromise.push(renderPromise.promise);
          this.task
            ?.render({
              pageProxy: result,
              pdfViewer: this._container,
              pageIndex: pageNum,
            })
            .then((result) => {
              renderPromise.resolve(result);
              capability.resolve(result);
            })
            .catch((err) => {
              capability.reject(err);
              renderPromise.reject(err);
            });
        });
      } else {
        console.error(
          "pageNum is required when type is single -- Opdf render single "
        );
        throw new Error("pageNum is required when type is single");
      }
    }

    return new Promise((resolve, reject) => {
      // 进行Render
      Promise.all(pageProxyPromises)
        .then((pageAll) => {
          if (pageAll?.length === 0) {
            return;
          }

          // 清空容器，text用于存储所有的文本
          let text: string = "";

          Promise.all(pageRenderPromise).then((value) => {
            console.log("render result --> ", value);

            value.forEach((item) => {
              // TODO: item?.pageProxy?.cleanup();
              this._container.appendChild(item?.pageWrap);
              text += item?.textContentItemsStr.join("") || "";
            });

            if (value?.length !== 0) {
              resolve({
                time: new Date().getTime(),
                text,
                generateHightLight: (
                  hightLight: MatchInfos[],
                  uniqueId: string
                ) => {
                  that.opdfStatus.status = "loaded";

                  // console.log("init search", hightLight);
                  const search = new Search({
                    search: hightLight || [],
                    preMatch: true,
                    uniqueId,
                  });

                  search.init(that.task?._pageContentMap);

                  const scroll = new Scroll(search.highLightContainers);
                  scroll.addScroll(value);
                },
              });
            }
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  // Update逻辑
  public update() {
    if (this.layer) {
      if (this.opdfStatus.status === "loaded") {
        this._container.innerHTML = "";
        this.render();
        // TODO: Css Render 逻辑, TODO: canvas 模糊
      }
    } else {
      console.error("canvas is not loaded - 146line");
    }
  }

  // Resize逻辑
  public listenResize(container?: HTMLElement | null) {
    if (container) {
      if (this._firstRender) {
        this._firstRender = false;
        return;
      }

      console.log("start resize listener");
      // 监听resize事件
      if (this._shouldListenResize) {
        const observer = new ResizeObserver(
          debounce(this._entryResize.bind(this), 200)
        );
        observer.observe(container);
      }
    }
  }

  private _entryResize(entries: ResizeObserverEntry[]) {
    if (this.opdfStatus.status !== "loaded") {
      return;
    }

    entries.forEach((entry) => {
      const { width } = entry.contentRect;

      if (this._containerLastStyle.width === null) {
        this._containerLastStyle.width = width;
        return;
      }

      if (Math.abs(width - this._containerLastStyle.width) > 5) {
        this._containerLastStyle.width = width;
        console.log("width change", entry.contentRect);
        this._requestUpdate();
      }
    });
  }

  private _requestUpdate() {
    if (this._frameId === null) {
      this._frameId = requestAnimationFrame(() => {
        this.update();
        this._frameId = null;
      });
    }
  }

  // TODO: destroy

  // 工具方法
  // 获取当前页的PageProxy
  public getPageProxy(pageNum: number) {
    if (!this._pdfDocument) {
      console.error("pdf document is not loaded");
      return;
    }

    return this._pdfDocument?.getPage(pageNum);
  }
}

export * from "./utils";
