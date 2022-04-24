interface NFTCardProps {
  user: any;
  stars: number;
  repos: any[];
  languages: [[string, number]];
}

export default function NFTCard(props: NFTCardProps) {
  return (
    <div className="h-96 w-96 bg-slate-200 p-4">
      <div className="flex flex-col">
        <div className="mb-4 flex flex-row items-center space-x-2">
          <img
            className="h-14 w-14 rounded-full border-2 border-white shadow-lg"
            src={props.user.avatar_url}
            alt="Profile picture"
          />
          <div className="flex h-full flex-col">
            <h1 className="font-bold">@{props.user.login}</h1>
            <div className="flex flex-row items-center space-x-1">
              <div className="flex flex-row items-center space-x-0.5">
                <div className="text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                  </svg>
                </div>
                <h2>{props.repos.length}</h2>
              </div>

              <div className="flex flex-row items-center space-x-0.5">
                <div className="text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h2>{props.stars}</h2>
              </div>
              <div className="flex flex-row items-center space-x-0.5">
                <div className="text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h2>{props.user.followers}</h2>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-4 h-0.5 bg-gray-300"></div>
        <div className="flex flex-col space-y-2">
          <div>
            <h2 className="text-sm text-gray-500">Favorite language</h2>
            <p className="font-bold">{props.languages[0][0]}</p>
          </div>
          <div>
            <h2 className="text-sm text-gray-500">Most popular repository</h2>
            <p className="font-bold">
              {
                props.repos.reduce((best, curr) => {
                  return curr.stargazers_count > best.stargazers_count
                    ? curr
                    : best;
                }, props.repos[0]).name
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
