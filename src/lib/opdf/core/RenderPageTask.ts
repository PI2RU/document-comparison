import {
  createPromiseCapability,
  PDFPageProxy,
  renderTextLayer,
} from "pdfjs-dist";

import { setScaleFactor } from "./Common";
import { Layer } from "./Layer";
import { RenderPageMap, RenderTask } from "./Types";

export class RenderPageTask {
  _layer: Layer;
  _currentScale?: number;
  _pageContentMap: RenderPageMap = new Map();

  constructor(props: { layer: Layer }) {
    this._layer = props.layer;
  }

  render({
    pdfViewer,
    pageProxy,
    pageIndex,
  }: {
    pdfViewer: HTMLElement | null;
    pageProxy: PDFPageProxy;
    pageIndex: number;
  }): Promise<RenderTask> {
    if (pdfViewer) {
      this._currentScale =
        this._layer.getScaleFactor({
          pageWidth: pageProxy.view[2],
          pageHeight: pageProxy.view[3],
        }) || 1;
    }

    const { canvas, context, transform, text, pageWrap, viewport } =
      this._layer.getPage(pageProxy);

    setScaleFactor(viewport.scale, pdfViewer);

    const render = pageProxy.render({
      canvasContext: context!,
      viewport,
      transform,
    }).promise;

    const capability = createPromiseCapability();

    render
      .then(() => {
        // TODO: 缩略图
        pageProxy.getTextContent().then(async (textContent) => {
          const pageContent = {
            textContentItemsStr: [],
            divs: [],
            textContent,
          };

          this._pageContentMap.set(pageIndex, pageContent);

          const task = renderTextLayer({
            textContentSource: textContent,
            container: text,
            viewport,
            textDivs: this._pageContentMap.get(pageIndex)?.divs || [],
            textContentItemsStr: pageContent.textContentItemsStr,
            // this._pageContentMap.get(pageIndex)?.textContentItemsStr || [],
          });

          await task.promise.then(() => {
            canvas.hidden = false;

            // console.log(
            //   `render ${pageIndex} page task end -->`,
            //   this._pageContentMap.get(pageIndex),
            //   new Date().getTime()
            // );

            capability.resolve({
              endTime: new Date().getTime(),
              pageIndex,
              pageWrap,
              textContentItemsStr: pageContent.textContentItemsStr || [],
            });
          });
        });
      })
      .catch((err) => {
        console.error(err);
        capability.reject(err);
      });

    return capability.promise;
  }
}
