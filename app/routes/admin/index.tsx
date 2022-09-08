import { Link } from "@remix-run/react";

export default function AdminIndexPage() {
  return (
    <p>
      No admin section/item selected. Select a section/item on the left.
      <br/>
      Or, create a{" "}
      <Link to="network/new" className="text-blue-500 underline">
        new network.
      </Link>
      {" or "}
      <Link to="coin/new" className="text-blue-500 underline">
        new coin.
      </Link>
    </p>
  );
}
