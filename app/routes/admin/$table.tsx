import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData, useParams } from "@remix-run/react";

import { getUser, requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { getNoteListItems } from "~/models/note.server";
import { getUsers } from "~/models/user.server";
//import { getNoteListItems as getEntities } from "~/models/note.server";
import invariant from "tiny-invariant";

// type LoaderData = {
//   noteListItems: Awaited<ReturnType<typeof getNoteListItems>>;
// };
type LoaderData = {
  table: string,
  items: Awaited<ReturnType<any>>;
};

const firstCapital = (input?:string) => input && input.length && (input[0] + input.substring(1));
const getModelsDictionary = {
  "note": getNoteListItems,
  "user": getUsers,
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  // const modelServer = require(`~/models/${params.table}.server`);
  // throw new Error(modelServer ? JSON.stringify(Object.keys(modelServer), null, 2) : typeof modelServer);

  invariant(params.table, "table not found");
  // const getFn = `get${firstCapital(params.table)}`;
  // const getEntities = require(`~/models/${params.table}.server`)[getFn];

  // const noteListItems = await getNoteListItems({ userId });
  // const items = await getEntities({ userId });
  var items:any[] = [];
  switch(params.table) {
    case "note":
      items = await getNoteListItems({ userId });
      break;
    case "user":
      items = await getUsers(/*{ userId }*/);
      break;
    default:
      throw new Error("Unhandled table: " + params.table);
  }
  return json<LoaderData>({ items, table: params.table });
};

export default function EntitiesPage() {
  const data = useLoaderData() as LoaderData;
  const user = useUser();

  return (
    <div className="flex h-full min-h-screen flex-col">
      {/* <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h2 className="text-2xl font-bold">
          <Link to=".">{data.table}s</Link>
        </h2>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header> */}

      <h2 className="text-2xl font-bold">{data.table}s</h2>
      <main className="flex h-full bg-white">

        <div className="h-full w-80 border-r bg-gray-50">
          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New {firstCapital(data.table)}
          </Link>

          <hr />

          {data./*noteListItems*/items .length === 0 ? (
            <p className="p-4">No {data.table}s yet</p>
          ) : (
            <ol>
              {data./*noteListItems*/items .map((note:any) => (
                <li key={note.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    to={note.id}
                  >
                    📝 {note.title}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
