import type { NextApiRequest, NextApiResponse } from "next";
// @ts-ignore
import { NFTStorage } from "nft.storage/dist/bundle.esm.min.js";
import { ethers, Wallet, ContractInterface, Transaction } from "ethers";
import assert from "assert";
import { Interface } from "@ethersproject/abi";
import abi from "../../nftContractAbi";
import { JsonRpcProvider } from "@ethersproject/providers";

const API_KEY = process.env.NEXT_NFT_STORAGE_API_KEY;
assert(Boolean(API_KEY), "NFT Storage key not provided");
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

const PRIVATE_KEY = process.env.NEXT_MINTER_PRIVATE_KEY;
assert(Boolean(PRIVATE_KEY), "Private key not provided");
const provider = new JsonRpcProvider("https://rpc-mumbai.matic.today", 137);
const minterWallet = new Wallet(PRIVATE_KEY!, provider);
const nftContract = new ethers.Contract("", new Interface(abi), minterWallet);
async function mintNft(
  address_to: string,
  tokenUri: string
): Promise<Transaction> {
  return nftContract.safeMint(address_to, tokenUri);
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
    const transaction = await mintNft(body.minter, metadata.ipnft);

    return res.status(201).json({ metadata, hash: transaction.hash });
  } catch (e) {
    return res.status(500).json(e);
  }
};
