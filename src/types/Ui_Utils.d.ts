declare module "pdfjs-dist/lib/web/ui_utils" {
  function approximateFraction(x: number): number[];
  function roundToDivide(x: number, div: number): number;
  class OutputScale {
    constructor();
    sx: number;
    sy: number;
    scaled: boolean;
  }
}
