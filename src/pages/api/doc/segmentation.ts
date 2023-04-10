import { NextApiRequest, NextApiResponse } from "next";
import nodejieba from "nodejieba";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const text = req.body;
    if (!text) {
      res.status(400).json({
        error: "text is required",
      });
      return;
    }

    const result = nodejieba.cut(text, true);

    res.status(200).json({
      data: result,
    });
  }
}
