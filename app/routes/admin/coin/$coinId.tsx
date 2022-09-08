import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { deleteCoin } from "~/models/coin.server";
import { getCoin } from "~/models/coin.server";
import { getNetwork } from "~/models/network.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  coin: NonNullable<Awaited<ReturnType<typeof getCoin>>>;
  network: NonNullable<Awaited<ReturnType<typeof getNetwork>>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.coinId, "coinId not found");

  const coin = await getCoin({ userId, id: params.coinId });
  if (!coin) {
    throw new Response("Not Found", { status: 404 });
  }

  const network = await getNetwork({ userId, id: coin.networkId });
  if(!network) {
    throw new Response("Network Not Found", { status: 500 });
  }

  return json<LoaderData>({ coin, network });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.coinId, "coinId not found");

  await deleteCoin({ userId, id: params.coinId });

  // return redirect("/notes");
  return redirect("..");
};

export default function CoinDetailsPage() {
  const data = useLoaderData() as LoaderData;

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.coin.title} ({data.coin.token})</h3>
      {/* <p className="py-6">{data.coin.body}</p> */}
      <p className="py-3"><strong>network: </strong>: {data.coin.networkId} ({data.network.title})</p>
      <p className="py-3"><strong>contract: </strong>{data.coin.contract}</p>
      <p className="py-3"><strong>wallet: </strong>{data.coin.wallet}</p>
      <hr className="my-4" />
      <Form method="post">
        <button
          type="submit"
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Delete
        </button>
      </Form>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Coin not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
