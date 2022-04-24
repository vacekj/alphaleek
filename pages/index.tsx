import { signIn, getSession, signOut } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import { Octokit } from "@octokit/rest";
import { createTokenAuth } from "@octokit/auth-token";
import abi from "../nftContractAbi";
import { useApiContract, useMoralis } from "react-moralis";
import { useState } from "react";
import { Button, ConnectButton } from "web3uikit";
import NFTCard from "../components/Card";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";
import { useCurrentChain } from "../components/ChainSelect";

const ChainSelect = dynamic(() => import("../components/ChainSelect"), {
  ssr: false,
});

interface Props {
  sesh: any;
  user: any;
}

export default function Component(props: Props) {
  const { user } = useMoralis();
  const [buttonText, setButtonText] = useState("Mint your Developer Badge");
  const [transactionHash, setTransactionHash] = useState("");
  const chain = useCurrentChain();

  return (
    <main
      className={`mx-auto max-w-xl flex flex-col justify-center items-center bg-slate-50 mt-10 rounded-xl`}
    >
      <div
        className={"mt-5 w-full flex justify-between items-center px-5 mb-10"}
      >
        <ChainSelect />
        <ConnectButton />
      </div>
      {props.sesh ? (
        <>
          <NFTCard
            user={props.user}
            repos={props.repos}
            stars={props.stars}
            languages={props.languages}
          />
          <button
            type="button"
            disabled={Boolean(transactionHash)}
            className="mt-10 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={async () => {
              const canvas = await html2canvas(
                document.querySelector("#nftcard")!
              );
              setButtonText("Minting...");
              const res = await fetch("/api/upload", {
                method: "POST",
                body: JSON.stringify({
                  user: { ...props.user, address: user!.attributes.ethAddress },
                  image: canvas.toDataURL(),
                }),
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
              }).then((r) => r.json());

              setTransactionHash(res.hash);
              setButtonText("Minted sucessfully!");
            }}
          >
            {buttonText}
          </button>
          {transactionHash && (
            <a
              className={"font-medium text-lg pt-3"}
              href={`${chain.chainParams.blockExplorerUrls[0]}/tx/${transactionHash}`}
            >
              View Transaction on Block Explorer
            </a>
          )}
          <button
            type="button"
            className="my-5 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => signOut()}
          >
            Sign out of GitHub
          </button>
        </>
      ) : (
        <>
          <div className={`p-5 text-center text-xl `}>
            Welcome hacker. Connect your GitHub, show your shadowy super skills
            and claim an on-chain proof of your prowess
          </div>
          <button
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-5"
            onClick={() => {
              signIn("github");
            }}
          >
            Sign in with Github
          </button>
        </>
      )}
    </main>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getSession(ctx);
  // @ts-ignore
  const token = session?.token?.accessToken;
  if (!token) {
    return {
      props: {},
    };
  }

  const auth = createTokenAuth(token);
  const authentication = await auth();
  const gh = new Octokit({
    auth: authentication.token,
  });

  const user = await gh.users.getAuthenticated();
  const allrepos = (
    await gh.repos.listForAuthenticatedUser({
      per_page: 100,
    })
  ).data;
  const repos = allrepos.filter((r) => r.owner.login === user.data.login);

  const totalStars = repos.reduce((acc, repo) => {
    return acc + repo.stargazers_count;
  }, 0);

  const languages = (
    await Promise.all(
      repos.map(async (r) => {
        return gh.repos.listLanguages({
          owner: r.owner.login,
          repo: r.name,
        });
      })
    )
  )
    .map((r) => {
      return r.data;
    })
    .reduce((acc, curr) => {
      for (const currKey in curr) {
        if (!acc.hasOwnProperty(currKey)) {
          acc[currKey] = curr[currKey];
        } else {
          acc[currKey] += curr[currKey];
        }
      }
      return acc;
    });

  let entries = Object.entries(languages);

  let langs = entries.sort((a, b) => b[1] - a[1]);

  const commits = (
    await Promise.all(
      repos.map(async (r) => {
        try {
          return await gh.repos.listCommits({
            owner: user.data.login,
            repo: r.name,
            author: user.data.login,
          });
        } catch (e) {
          return { status: false, data: {} };
        }
      })
    )
  )
    .filter((c) => c.status)
    .map((c) => c.data)
    .flat();

  /* Mashallah */
  return {
    props: {
      user: user.data,
      sesh: session,
      repos: repos,
      languages: langs,
      stars: totalStars,
      commits: commits,
    },
  };
}
