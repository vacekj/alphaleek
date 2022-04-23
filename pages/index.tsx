import { useSession, signIn, signOut, getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import { Session } from "next-auth";
import { Octokit } from "@octokit/rest";
import { createTokenAuth } from "@octokit/auth-token";

interface Props {
  sesh:
    | (Session & {
        token: { accessToken: string };
      })
    | null;
}

export default function Component(props: Props) {
  return (
    <div>
      <div>
        {props.sesh ? (
          <div>{props.sesh.token.accessToken}</div>
        ) : (
          <button
            onClick={() => {
              signIn("github");
            }}
          >
            Sign in
          </button>
        )}
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

  const repos = await gh.repos.listForAuthenticatedUser();

  const totalStars = repos.data.reduce((acc, repo) => {
    return repo.stargazers_count;
  }, 0);

  const languages = (
    await Promise.all(
      repos.data.map(async (r) => {
        return gh.repos.listLanguages({
          owner: r.owner.login,
          repo: r.name,
        });
      })
    )
  ).map((r) => {
    return r.data;
  });

  const user = await gh.users.getAuthenticated();
  const commits = await Promise.all(
    repos.data.map(async (r) => {
      try {
        return await gh.repos.listCommits({
          owner: user.data.login,
          repo: r.name,
          author: user.data.login,
        });
      } catch (e) {
        return {};
      }
    })
  );

  return {
    props: {
      test: true,
      sesh: session,
      repos: repos.data,
      languages,
      totalStars,
      commits,
    },
  };
}
