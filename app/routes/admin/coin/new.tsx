import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";

import { getNetworkListItems } from "~/models/network.server";
import { createCoin } from "~/models/coin.server";
import { requireUserId } from "~/session.server";

import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

type LoaderData = {
  networkListItems: Awaited<ReturnType<typeof getNetworkListItems>>;
};
export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const networkListItems = await getNetworkListItems({ userId });
  return json<LoaderData>({ networkListItems });
};


type ActionData = {
  errors?: {
    title?: string;
    // body?: string;
    networkId?: string;
    token?: string;
    contract?: string;
    wallet?: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const title = formData.get("title");
  const networkId = formData.get("networkId");
  const token = formData.get("token");
  const contract = formData.get("contract");
  const wallet = formData.get("wallet");

  if (typeof title !== "string" || title.length === 0) {
    return json<ActionData>(
      { errors: { title: "Title is required" } },
      { status: 400 }
    );
  }

  if (typeof networkId !== "string" || networkId.length === 0) {
    return json<ActionData>(
      { errors: { networkId: "NetworkId is required" } },
      { status: 400 }
    );
  }

  if (typeof token !== "string" || token.length === 0) {
    return json<ActionData>(
      { errors: { token: "Token is required" } },
      { status: 400 }
    );
  }

  // if (typeof contract !== "string" || contract.length === 0) {
  //   return json<ActionData>(
  //     { errors: { contract: "Contract is required" } },
  //     { status: 400 }
  //   );
  // }

  // if (typeof wallet !== "string" || wallet.length === 0) {
  //   return json<ActionData>(
  //     { errors: { wallet: "Wallet is required" } },
  //     { status: 400 }
  //   );
  // }

  const coin = await createCoin({ userId, title, networkId, token,
    // contract,
    contract: typeof contract === 'string' ? contract : undefined,
    // wallet,
    wallet: typeof wallet === 'string' ? wallet : undefined,
  });

  //return redirect(`/coins/${coin.id}`);
  return redirect(`/admin/coin/${coin.id}`);
};

export default function NewCoinPage() {
  const data = useLoaderData() as LoaderData;

  const actionData = useActionData() as ActionData;
  const titleRef = React.useRef<HTMLInputElement>(null);
  const tokenRef = React.useRef<HTMLInputElement>(null);
  const networkIdRef = React.useRef<HTMLSelectElement>(null);
  const contractRef = React.useRef<HTMLInputElement>(null);
  const walletRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.token) {
      tokenRef.current?.focus();
    } else if (actionData?.errors?.networkId) {
      networkIdRef.current?.focus();
    } else if (actionData?.errors?.contract) {
      contractRef.current?.focus();
    } else if (actionData?.errors?.wallet) {
      walletRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Title: </span>
          <input
            ref={titleRef}
            name="title"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.title ? true : undefined}
            aria-errormessage={
              actionData?.errors?.title ? "title-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.title && (
          <div className="pt-1 text-red-700" id="title-error">
            {actionData.errors.title}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Token: </span>
          <input
            ref={tokenRef}
            name="token"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.token ? true : undefined}
            aria-errormessage={
              actionData?.errors?.token ? "token-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.token && (
          <div className="pt-1 text-red-700" id="token-error">
            {actionData.errors.token}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Network: </span>
          <select
            ref={networkIdRef}
            name="networkId"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.networkId ? true : undefined}
            aria-errormessage={
              actionData?.errors?.networkId ? "networkId-error" : undefined
            }
          >
            {data.networkListItems.map((network) => <option key={network.id} value={network.id}>{network.title}</option>)}
          </select>
        </label>
        {actionData?.errors?.networkId && (
          <div className="pt-1 text-red-700" id="networkId-error">
            {actionData.errors.networkId}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Contract: </span>
          <input
            ref={contractRef}
            name="contract"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.contract ? true : undefined}
            aria-errormessage={
              actionData?.errors?.contract ? "contract-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.contract && (
          <div className="pt-1 text-red-700" id="contract-error">
            {actionData.errors.contract}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Wallet: </span>
          <input
            ref={walletRef}
            name="wallet"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.wallet ? true : undefined}
            aria-errormessage={
              actionData?.errors?.wallet ? "wallet-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.wallet && (
          <div className="pt-1 text-red-700" id="wallet-error">
            {actionData.errors.wallet}
          </div>
        )}
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
    </Form>
  );
}
