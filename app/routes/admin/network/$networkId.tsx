import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { deleteNetwork } from "~/models/network.server";
import { getNetwork } from "~/models/network.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  network: NonNullable<Awaited<ReturnType<typeof getNetwork>>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.networkId, "networkId not found");

  const network = await getNetwork({ userId, id: params.networkId });
  if (!network) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ network });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.networkId, "networkId not found");

  await deleteNetwork({ userId, id: params.networkId });

  return redirect("/admin/network");
};

export default function NetworkDetailsPage() {
  const data = useLoaderData() as LoaderData;

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.network.title}</h3>
      {/* <p className="py-6">{data.network.body}</p> */}
      <p className="py-3">{data.network.url}</p>
      <p className="py-3"><strong>Test?: </strong>{data.network.isTest?.toString()}</p>
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
    return <div>Network not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
