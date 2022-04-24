import type { NextApiRequest, NextApiResponse } from "next";
// @ts-ignore
import { NFTStorage } from "nft.storage";
import { ethers, Wallet, ContractInterface, Transaction } from "ethers";
import assert from "assert";
import { Interface } from "@ethersproject/abi";
import abi from "../../nftContractAbi";
import { JsonRpcProvider } from "@ethersproject/providers";
import { chains } from "../../components/ChainSelect";

const API_KEY = process.env.NEXT_NFT_STORAGE_API_KEY;
assert(Boolean(API_KEY), "NFT Storage key not provided");
const client = new NFTStorage({ token: API_KEY! });

async function storeNft(
  image: string,
  user: {
    address: string;
    username: string;
    stars: string;
    followers: string;
    profile_pic: string;
    best_language: [string, number];
    repos: number;
  }
) {
  const blob = await fetch(image).then((res) => res.blob());

  const nft = {
    name: `${user.username}'s AlphaLeek Badge`,
    description: "Show your developer prowess with this personal Badge",
    image: blob,
    properties: {
      user,
    },
  };

  return await client.store(nft);
}

const PRIVATE_KEY = process.env.NEXT_MINTER_PRIVATE_KEY;
assert(Boolean(PRIVATE_KEY), "Private key not provided");

async function mintNft(
  address_to: string,
  tokenUri: string
): Promise<Transaction> {
  return;
}

type Request = {
  user: {
    address: string;
    username: string;
    stars: string;
    followers: string;
    profile_pic: string;
    best_language: [string, number];
    repos: number;
  };
  image: string;
  network: number;
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body as Request;

  if (!body.user) {
    return res.status(400).json({
      error: "Bad request",
      body: req.body,
    });
  }

  const network = chains[body.network];

  try {
    const metadata = await storeNft(body.image, body.user);
    const provider = new JsonRpcProvider(
      "https://rpc-mumbai.matic.today",
      "any"
    );
    const minterWallet = new Wallet(PRIVATE_KEY!, provider);
    const nftContract = new ethers.Contract(
      "0xa43a157dc95D0e467042C0548512fa6Da36aE19f",
      new Interface(abi),
      minterWallet
    );
    const transaction = await nftContract.safeMint(
      body.user.address,
      metadata.ipnft
    );

    return res.status(201).json({ metadata, hash: transaction.hash });
  } catch (e) {
    return res
      .status(500)
      .json(JSON.stringify(e, Object.getOwnPropertyNames(e)));
  }
};
