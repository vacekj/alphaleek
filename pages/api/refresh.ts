import { NextApiRequest, NextApiResponse } from "next";

type Request = {
  github_username: string;
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body as Request;

  if (!body.github_username) {
    return res.status(400).json({
      error: "Bad request",
    });
  }
};
