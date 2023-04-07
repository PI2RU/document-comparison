import { PDFPageProxy, PixelsPerInch, setLayerDimensions } from "pdfjs-dist";
import {
  approximateFraction,
  roundToDivide,
} from "pdfjs-dist/lib/web/ui_utils";
import { DEFAULT_SCALE } from "../constant";

import {
  PAGE_AUTO_SCALE,
  SCROLLBAR_PADDING,
  SINGLE_PAGE,
  TEXT_LAYER_ITEM,
  VERTICAL_PADDING,
} from "../constant";

export class Layer {
  private readonly _container: HTMLElement | null = document.body;

  constructor({ container }: { container: HTMLElement }) {
    this._container = container || document.body;
  }

  public getPage(pageProxy: PDFPageProxy) {
    const pageWrap = document.createElement("div");
    pageWrap.className = SINGLE_PAGE;

    const { canvas, context, transform, viewport } =
      this.createPageCanvas(pageProxy);

    const textDiv = this.createPageTextDiv();

    const canvasWrapper = document.createElement("div");
    canvasWrapper.className = "canvasWrapper";

    canvas.hidden = true;

    canvasWrapper.appendChild(canvas);
    pageWrap.append(canvasWrapper, textDiv);

    setLayerDimensions(pageWrap, viewport);

    const textContentStream = pageProxy.streamTextContent({
      includeMarkedContent: true,
      disableCombineTextItems: false,
    });

    return {
      pageWrap,
      textContentStream,
      context,
      transform,
      canvas,
      text: textDiv,
      viewport,
    };
  }

  private createPageTextDiv() {
    const pageDiv = document.createElement("div");
    pageDiv.className = TEXT_LAYER_ITEM;
    return pageDiv;
  }

  private createPageCanvas(pageProxy: PDFPageProxy) {
    const viewport = this.getViewport(pageProxy);
    const outputScale = this.getOutputScale();

    const [x, y] = approximateFraction(outputScale);

    // Set the size for canvas here instead of inside `render` to avoid the black flickering
    const width = roundToDivide(viewport.width * outputScale, x);
    const height = roundToDivide(viewport.height * outputScale, x);

    const styleHeight = roundToDivide(Number(viewport.height), y);
    const styleWidth = roundToDivide(Number(viewport.width), y);

    const canvas = document.createElement("canvas");

    canvas.setAttribute("role", "presentation");
    canvas.setAttribute("aria-hidden", "true");

    canvas.width = width;
    canvas.height = height;

    canvas.style.width = styleWidth + "px";
    canvas.style.height = styleHeight + "px";

    const transform =
      outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

    const canvasStyle = {
      width,
      height,
      styleWidth,
      styleHeight,
    };

    return {
      canvas,
      canvasStyle,
      transform,
      context: canvas.getContext("2d"),
      viewport,
    };
  }

  private getViewport(pageProxy: PDFPageProxy) {
    const scale =
      this.getScaleFactor({
        pageWidth: pageProxy.view[2],
        pageHeight: pageProxy.view[3],
      }) || DEFAULT_SCALE;

    let viewport = pageProxy.getViewport({
      scale,
    });

    // from pdf.js -web @ Restrict the test from creating a canvas that is too big.
    const MAX_CANVAS_PIXEL_DIMENSION = 4096;
    const largestDimension = Math.max(viewport.width, viewport.height);

    if (
      Math.floor(largestDimension * this.getOutputScale()) >
      MAX_CANVAS_PIXEL_DIMENSION
    ) {
      const rescale = MAX_CANVAS_PIXEL_DIMENSION / largestDimension;
      viewport = viewport.clone({
        scale: PixelsPerInch.PDF_TO_CSS_UNITS * rescale,
      });
    }

    return viewport;
  }

  getScaleFactor({
    pageWidth,
    pageHeight,
  }: {
    pageWidth: number;
    pageHeight: number;
  }) {
    let lastScale = PAGE_AUTO_SCALE;

    if (this._container) {
      const pageWidthScale =
        this._container.clientWidth - SCROLLBAR_PADDING > 0
          ? (
              (this._container.clientWidth - SCROLLBAR_PADDING) /
              pageWidth
            )?.toFixed(4)
          : DEFAULT_SCALE;

      const pageHeightScale =
        this._container.clientHeight - VERTICAL_PADDING > 0
          ? (
              (this._container.clientHeight - VERTICAL_PADDING) /
              pageHeight
            )?.toFixed(4)
          : DEFAULT_SCALE;

      lastScale = Math.min(Number(pageWidthScale), Number(pageHeightScale));

      return lastScale;
    }
  }

  private getOutputScale() {
    return window.devicePixelRatio || 1;
  }
}
