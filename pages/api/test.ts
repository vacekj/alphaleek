import { NextApiRequest, NextApiResponse } from "next";
import fs, { readFileSync } from "fs";
import html2canvas from "html2canvas";
import { JSDOM } from "jsdom";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const file = readFileSync("public/thething.html").toString();
  const body = new JSDOM(file).window.document.body;
  const canvas = await html2canvas(body);
  return res.status(200).send(canvas);
};
