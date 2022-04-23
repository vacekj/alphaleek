import { useSession, signIn, signOut, getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import { Session } from "next-auth";
import { Octokit } from "@octokit/rest";
import { createTokenAuth } from "@octokit/auth-token";

interface Props {}

export default function Component(props: Props) {
  return (
    <div>
      <div>
        {props.sesh ? (
          <pre>{JSON.stringify(props, null, 4)}</pre>
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
    .filter((d) => Object.keys(d).length === 0);

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

  return {
    props: {
      sesh: session,
      repos: repos,
      languages,
      totalStars,
      commits: commits,
    },
  };
}
