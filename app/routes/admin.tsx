import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
// import { getNoteListItems } from "~/models/note.server";
import { getNetworkListItems/*, getNetworks*/ } from "~/models/network.server";
import { getCoinListItems } from "~/models/coin.server";

// import arc from "@architect/functions";

type LoaderData = {
  // noteListItems: Awaited<ReturnType<typeof getNoteListItems>>;
  // tables: string[];
  networkListItems: Awaited<ReturnType<typeof getNetworkListItems>>;
  coinListItems: Awaited<ReturnType<typeof getCoinListItems>>;
};

// const excludeTableKeys:string[] = ["reflect","name","_name", "password"];
export const loader: LoaderFunction = async ({ request }) => {
  // const userId = await requireUserId(request);
  // const noteListItems = await getNoteListItems({ userId });
  // return json<LoaderData>({ noteListItems });

  // const db = await arc.tables();
  // const tables = Object.keys(db).filter(key => !excludeTableKeys.includes(key));
  // return json<LoaderData>({ tables });

  const userId = await requireUserId(request);
  const networkListItems = await getNetworkListItems({ userId });
  const coinListItems = await getCoinListItems({ userId });
  return json<LoaderData>({ networkListItems, coinListItems });
};

export default function AdminPage() {
  const data = useLoaderData() as LoaderData;
  const user = useUser();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Admin</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <Link to="./network" className="block bg-slate-600 p-4 text-white text-xl font-bold">Networks</Link>
          <Link to="./network/new" className="block p-4 text-xl text-blue-500">
            + New Network
          </Link>

          <hr />

          {data.networkListItems.length === 0 ? (
            <p className="p-4">No networks yet</p>
          ) : (
            <ol>
              {data.networkListItems.map((network) => (
                <li key={network.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    //to={network.id}
                    to={`./network/${network.id}`}
                  >
                    📝 {network.title}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}

          <Link to="./coin" className="block bg-slate-600 p-4 text-white text-xl font-bold">Coins</Link>
          <Link to="./coin/new" className="block p-4 text-xl text-blue-500">
            + New Coin
          </Link>

          <hr />

          {data.networkListItems.length === 0 ? (
            <p className="p-4">No coins yet</p>
          ) : (
            <ol>
              {data.coinListItems.map((coin) => (
                <li key={coin.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    //to={coin.id}
                    to={`./coin/${coin.id}`}
                  >
                    📝 {coin.title}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}

          {/* {data.tables.length === 0 ? (
            <p className="p-4">No tables</p>
          ) : (
            <ol>
              {data.tables.map((table) => (
                <li key={table}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    to={table}
                  >
                    📝 {table}
                  </NavLink>
                </li>
              ))}
            </ol>
          )} */}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
