import { Link } from "@remix-run/react";

export default function NetworkIndexPage() {
  return (
    <p>
      No network selected. Select a network on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new network.
      </Link>
    </p>
  );
}
