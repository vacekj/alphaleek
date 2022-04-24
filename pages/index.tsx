import { signIn, getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import { Octokit } from "@octokit/rest";
import { createTokenAuth } from "@octokit/auth-token";
import abi from "../nftContractAbi";
import { useApiContract } from "react-moralis";
import { useState } from "react";
import { ConnectButton } from "web3uikit";
import NFTCard from "../components/Card";

interface Props {
  sesh: any;
  user: any;
}

export default function Component(props: Props) {
  const [address, setAddress] = useState("");

  return (
    <div>
      <input value={address} onChange={(e) => setAddress(e.target.value)} />
      <div>
        {props.sesh ? (
          <>
            <NFTCard
              user={props.user}
              repos={props.repos}
              stars={props.stars}
              languages={props.languages}
            />
            <button
              onClick={async () => {
                fetch("/api/upload", {
                  method: "POST",
                  body: JSON.stringify({
                    minter: address,
                    github_username: props.user.login,
                  }),
                });
              }}
            >
              Mint
            </button>
            <pre>{JSON.stringify(props, null, 4)}</pre>
          </>
        ) : (
          <button
            onClick={() => {
              signIn("github");
            }}
          >
            Sign in
          </button>
        )}
        <ConnectButton />
      </div>
    </div>
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
