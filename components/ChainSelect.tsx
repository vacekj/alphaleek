import { useEffect, useState } from "react";
// @ts-ignore
import { Listbox } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";
import { useMoralisWeb3Api } from "react-moralis";

export function useCurrentChain() {
  const [currentChain, setCurrentChain] = useState(chains[0]);

  useEffect(() => {
    // @ts-ignore
    window.ethereum.request({ method: "eth_chainId" }).then((id) => {
      setCurrentChain(chains.find((p) => p.chainParams.chainId === id)!);
    });
  }, []);

  if (typeof window !== "undefined") {
    // @ts-ignore
    window.ethereum.on("chainChanged", (chainId: string) =>
      setCurrentChain(chains.find((p) => p.chainParams.chainId === chainId)!)
    );
  }

  return currentChain;
}

export const chains = [
  {
    id: 1,
    name: "Polygon",
    avatar: "/polygon.svg",
    chainParams: {
      chainId: "0x13881",
      chainName: "Mumbai",
      rpcUrls: ["https://rpc-mumbai.matic.today"],
      nativeCurrency: {
        name: "Matic",
        symbol: "Matic",
        decimals: 18,
      },
      blockExplorerUrls: ["https://explorer-mumbai.maticvigil.com"],
    },
    contract: "0xa43a157dc95D0e467042C0548512fa6Da36aE19f",
  },
  {
    id: 2,
    name: "Optimism",
    avatar:
      "https://raw.githubusercontent.com/ethereum-optimism/brand-kit/main/assets/svg/Profile-Logo.svg",
    chainParams: {
      chainId: "0x45",
      chainName: "Optimistic Kovan",
      rpcUrls: ["https://kovan.optimism.io"],
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
      blockExplorerUrls: ["https://kovan-optimistic.etherscan.io"],
    },
  },
  {
    id: 3,
    name: "ZKSync",
    avatar:
      "https://pbs.twimg.com/profile_images/1228405960835813378/eH3FdBKB_400x400.jpg",
    chainParams: {
      chainId: "0x118",
      chainName: "zkSync alpha testnet",
      rpcUrls: ["https://zksync2-testnet.zksync.dev"],
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
      blockExplorerUrls: ["https://zksync2-testnet.zkscan.io/"],
    },
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Example() {
  const selected = useCurrentChain();

  return (
    <Listbox
      value={selected}
      // @ts-ignore
      onChange={async (e) => {
        try {
          // @ts-ignore
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: e.chainParams.chainId }],
          });
        } catch (error) {
          // @ts-ignore
          if (error.code === 4902) {
            try {
              // @ts-ignore
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [e.chainParams],
              });
            } catch (error) {
              // @ts-ignore
              alert(error.message);
            }
          }
        }
      }}
    >
      {({ open }) => (
        <>
          <div className="mt-1 relative w-48">
            <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <span className="flex items-center">
                <img
                  src={selected.avatar}
                  alt=""
                  className="flex-shrink-0 h-6 w-6 rounded-full"
                />
                <span className="ml-3 block truncate">{selected.name}</span>
              </span>
              <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <SelectorIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {chains.map((person) => (
                <Listbox.Option
                  key={person.id}
                  className={({ active }) =>
                    classNames(
                      active ? "text-white bg-indigo-600" : "text-gray-900",
                      "cursor-default select-none relative py-2 pl-3 pr-9"
                    )
                  }
                  value={person}
                >
                  {({ selected, active }) => (
                    <>
                      <div className="flex items-center">
                        <img
                          src={person.avatar}
                          alt=""
                          className="flex-shrink-0 h-6 w-6 rounded-full"
                        />
                        <span
                          className={classNames(
                            selected ? "font-semibold" : "font-normal",
                            "ml-3 block truncate"
                          )}
                        >
                          {person.name}
                        </span>
                      </div>

                      {selected ? (
                        <span
                          className={classNames(
                            active ? "text-white" : "text-indigo-600",
                            "absolute inset-y-0 right-0 flex items-center pr-4"
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </>
      )}
    </Listbox>
  );
}
