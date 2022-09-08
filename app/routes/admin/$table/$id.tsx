import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

// import { deleteNote } from "~/models/note.server";
// import { getNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";

// type LoaderData = {
//   note: NonNullable<Awaited<ReturnType<typeof getNote>>>;
// };
type LoaderData = any;

const firstCapital = (input?:string) => input && input.length && input[0].toUpperCase() + input.substring(1);

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  // const userId = await requireUserId(request);
  invariant(params.table, "table not found");
  invariant(params.id, "id not found");

  const getFn = `get${firstCapital(params.table)}`;
  const getEntity = require(`~/models/${params.table}.server`)[getFn];

  // const note = await getNote({ userId, id: params.noteId });
  // if (!note) {
  const entity = await getEntity({ userId, id: params.id });
  if(!entity) {
    throw new Response("Not Found", { status: 404 });
  }
  // return json<LoaderData>({ note });
  return json<LoaderData>({ [params.table]: entity });
};

export const action: ActionFunction = async ({ request, params }) => {
  invariant(params.table, "table not found");

  //import { deleteNote } from "~/models/note.server";
  const deleteFn = `delete${firstCapital(params.table)}`;
  const deleteEntity = require(`~/models/${params.table}.server`)[deleteFn];

  const userId = await requireUserId(request);
  //invariant(params.noteId, "noteId not found");
  invariant(params.id, "id not found");

  //await deleteNote({ userId, id: params.noteId });
  await deleteEntity({ userId, id: params.id });

  // return redirect("/notes");
  return redirect(`/${params.table}s`);
};

// export default function NoteDetailsPage() {
export default function EntityDetailsPage() {
    const data = useLoaderData() as LoaderData;

  return (
    <div>
      {/* <h3 className="text-2xl font-bold">{data.note.title}</h3>
      <p className="py-6">{data.note.body}</p> */}
      {Object.keys(data).map(key => 
        <div>
          <strong>{key}: </strong>
          <span>{data[key].toString()}</span>
        </div>
      )}
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
    return <div>Note not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
