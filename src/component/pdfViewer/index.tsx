import React, { RefObject, useEffect, useRef, useState } from "react";
import { OPdf } from "../../lib/opdf";
import styles from "./index.module.scss";

const pdfUrl = "/assets/fangchan.pdf";

const result = {
  summary: [
    "本案系房产争议案件，现将我方的事实和证据陈述如下：我方为房屋的合法所有人，拥有该房屋的产权，但被告未经我方同意，私自侵占该房屋，并在该房屋内进行了装修和改造，严重损害了我方的合法权益。我方请求贵庭作出被告立即停止对该房屋的占用和改造行为，赔偿我方因其侵占和损坏该房屋产权而遭受的一切经济损失，恢复我方的房屋原状，赔偿因此产生的所有费用等诉讼请求。",
  ],

  keywords: [
    "房产争议案件",
    "合法所有人",
    "侵占该房屋",
    "装修和改造",
    "经济损失",
  ],
};

const light = result.keywords.map((item: string) => {
  return {
    sortId: [1],
    text: item,
  };
});

export const PdfViewer = ({
  pdfRef,
  pdfRef2,
  setSummary,
}: {
  pdfRef: RefObject<HTMLDivElement>;
  pdfRef2: RefObject<HTMLDivElement>;
  setSummary: (data: { summary: string[]; keywords: string[] }) => void;
}) => {
  // TODO:切换全部渲染和单页渲染的缓存
  const [Opdf, setOpdf] = useState<OPdf | null>(null);
  const [Opdf2, setOpdf2] = useState<OPdf | null>(null);

  const resizerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const pdfRefCurrent = pdfRef.current;
    const pdfRef2Current = pdfRef2.current;

    if (pdfRefCurrent && pdfRef2Current) {
      const handleScroll1 = (event: any) => {
        pdfRef2.current!.scrollTop = event.target.scrollTop;
      };

      const handleScroll2 = (event: any) => {
        pdfRef.current!.scrollTop = event.target.scrollTop;
      };

      pdfRef.current.addEventListener("scroll", handleScroll1);
      pdfRef2.current.addEventListener("scroll", handleScroll2);

      return () => {
        pdfRefCurrent.removeEventListener("scroll", handleScroll1);
        pdfRef2Current.removeEventListener("scroll", handleScroll2);
      };
    }
  }, [pdfRef, pdfRef2]);

  useEffect(() => {
    const resizerRefCurrent = resizerRef.current;
    if (resizerRefCurrent) {
      const handleMouseDown = (event: MouseEvent) => {
        setIsResizing(true);
        event.preventDefault();
      };

      const handleMouseMove = (event: MouseEvent) => {
        if (!isResizing) return;

        const containerWidth = pdfRef.current?.parentElement?.clientWidth;
        if (containerWidth && pdfRef2.current) {
          const newWidth = (event.clientX / containerWidth) * 100;
          pdfRef.current.style.width = newWidth + "%";
          pdfRef2.current.style.width = 100 - newWidth + "%";
        }
      };

      const handleMouseUp = () => {
        setIsResizing(false);
      };

      resizerRef.current?.addEventListener("mousedown", handleMouseDown);

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        resizerRefCurrent?.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, []);

  useEffect(() => {
    if (!pdfRef.current) return;
    const opdf = new OPdf({
      src: pdfUrl,
      container: pdfRef.current!,
      canvasType: "svg",
      shouldListenResize: true,
    });

    opdf.init().then(async (opdfInstance) => {
      await opdfInstance
        .render()
        .then(async (data) => {
          setSummary(result);
          setTimeout(() => {
            data.generateHightLight(light, "pdf1");
          }, 100);

          // TODO: resize
          opdfInstance.listenResize(pdfRef.current);
          setOpdf(Opdf);
        })
        .catch((err) => {
          console.log("err---->", err);
        });
    });
  }, []);

  useEffect(() => {
    const opdf2 = new OPdf({
      src: pdfUrl,
      container: pdfRef2.current!,
      canvasType: "svg",
      shouldListenResize: true,
    });

    opdf2.init().then(async (opdfInstance) => {
      const data = await opdfInstance.render();

      setTimeout(() => {
        data.generateHightLight(light, "pdf2");
      }, 100);

      // TODO: resize
      opdfInstance.listenResize(pdfRef2.current);
      setOpdf2(Opdf);
    });
  }, [Opdf, Opdf2, pdfRef2]);

  return (
    <>
      <div className={styles.pdfViewerWrap}>
        <div ref={pdfRef} className={`${styles.pdfViewer} scroll-smooth`} />
      </div>
      <div ref={resizerRef} />
      <div className={styles.pdfViewerWrap}>
        <div ref={pdfRef2} className={`${styles.pdfViewer} scroll-smooth`} />
      </div>
    </>
  );
};
