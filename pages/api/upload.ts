import type { NextApiRequest, NextApiResponse } from "next";
import { NFTStorage, File } from "nft.storage";

const API_KEY = process.env.NEXT_NFT_STORAGE_API_KEY;
const client = new NFTStorage({ token: API_KEY! });

async function storeNft(image: string, minterAddress: string) {
  const buff = Buffer.from(image, "base64url");

  const nft = {
    image: new File([buff], minterAddress + ".png", {
      type: "image/png",
    }),
    name: "AlphaLeek Badge",
    description: "",
    properties: {
      recipient: minterAddress,
    },
  };

  return await client.store(nft);
}

type Request = {
  minter: string;
  image: string;
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body as Request;

  if (!body.minter || !body.image) {
    return res.status(400).json({
      error: "Bad request",
    });
  }

  try {
    const metadata = await storeNft(body.image, body.minter);
    return res.status(201).json(metadata);
  } catch (e) {
    return res.status(500).json(e);
  }
};
