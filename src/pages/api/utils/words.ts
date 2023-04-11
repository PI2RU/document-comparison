import { NextApiRequest, NextApiResponse } from "next";
import nodejieba from "nodejieba";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const reqText = req.body;

    if (!reqText) {
      res.status(400).json({ error: "请提供需要分词的文本" });
      return;
    }

    if (typeof reqText !== "string") {
      res.status(400).json({ error: "文本必须是字符串" });
      return;
    }

    const result = nodejieba.cut(reqText);

    res.status(200).json({ result });
  } else {
    res.status(400).json({ error: "请使用 POST 方法" });
  }
}
