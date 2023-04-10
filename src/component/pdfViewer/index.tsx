import { RefObject, useEffect, useState } from "react";
// import useSWRMutation from "swr/mutation";
import { OPdf } from "../../lib/opdf";

const pdfUrl = "/assets/fangchan.pdf";

async function update(url: string, { arg }: { arg: string }) {
  return fetch(url, {
    method: "POST",
    body: arg,
  }).then((res) => res.json());
}

const result = {
  summary: [
    "本案系房产争议案件，现将我方的事实和证据陈述如下：我方为房屋的合法所有人，拥有该房屋的产权，但被告未经我方同意，私自侵占该房屋，并在该房屋内进行了装修和改造，严重损害了我方的合法权益。我方请求贵庭作出被告立即停止对该房屋的占用和改造行为，赔偿我方因其侵占和损坏该房屋产权而遭受的一切经济损失，恢复我方的房屋原状，赔偿因此产生的所有费用等诉讼请求。",
  ],

  keywords: [
    "房产争议案件",
    "房屋合法所有人",
    "侵占该房屋",
    "装修和改造",
    "赔偿经济损失",
  ],
};

const light = result.keywords.map((item: string) => {
  return {
    index: [1],
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
  // const { trigger: getSummary, isMutating } = useSWRMutation(
  //   "/api/doc/summary",
  //   update,
  //   {
  //     onSuccess: (data) => {
  //       console.log("getSummary->", data);
  //       setSummary(result);
  //     },
  //   }
  // );

  // const { trigger: getSegmentation } = useSWRMutation(
  //   "/api/doc/segmentation",
  //   update
  // );

  // TODO:切换全部渲染和单页渲染的缓存
  const [Opdf, setOpdf] = useState<OPdf | null>(null);
  const [Opdf2, setOpdf2] = useState<OPdf | null>(null);

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
      <div id="pdfViewer" ref={pdfRef} className="pdfViewer"></div>
      <div id="pdfViewer2" ref={pdfRef2} className="pdfViewer"></div>
    </>
  );
};
