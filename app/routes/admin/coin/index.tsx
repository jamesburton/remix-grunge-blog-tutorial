import { Link } from "@remix-run/react";

export default function CoinIndexPage() {
  return (
    <p>
      No coin selected. Select a coin on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new coin.
      </Link>
    </p>
  );
}
