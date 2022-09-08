import arc from "@architect/functions";
import cuid from "cuid";

import type { User } from "./user.server";
import type { Network } from "./network.server";
// import { skToId as networkSkToId, idToSk as idToNetworkSk } from "./network.server";

// NB: For help with arc.tables and querying, etc:
// See https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.tables()

export type Coin = {
  id: ReturnType<typeof cuid>;
  userId: User["id"];
  networkId: Network["id"];
  token: string;
  title: string;
  contract: string;
  wallet: string;
};

type CoinItem = {
  pk: User["id"];
  sk: `coin#${Coin["id"]}`;
};

const skToId = (sk: CoinItem["sk"]): Coin["id"] => sk.replace(/^coin#/, "");
const idToSk = (id: Coin["id"]): CoinItem["sk"] => `coin#${id}`;

export async function getCoin({
  id,
  userId,
}: Pick<Coin, "id" | "userId">): Promise<Coin | null> {
  const db = await arc.tables();

  const result = await db.coin.get({ pk: userId, sk: idToSk(id) });

  if (result) {
    return {
      userId: result.pk,
      id: result.sk,
      networkId: result.networkId,
      token: result.token,
      title: result.title,
      contract: result.contract,
      wallet: result.wallet,
    };
  }
  return null;
}

export async function getCoinListItems({
  userId,
}: Pick<Coin, "userId">): Promise<Array<Pick<Coin, "id" | "networkId" | "title" | "token" | "contract" | "wallet">>> {
  const db = await arc.tables();

  const result = await db.coin.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": userId },
  });

  return result.Items.map((n: any) => ({
    title: n.title,
    id: skToId(n.sk),
    networkId: n.networkId,
    token: n.token,
    contract: n.contract,
    wallet: n.wallet,
  }));
}

export async function createCoin({
  token,
  title,
  userId,
  networkId,
  contract,
  wallet,
}: (Partial<Coin> & Pick<Coin, "title" | "userId" | "networkId" | "token" /*| "contract" | "wallet"*/>)): Promise<Coin> {
  const db = await arc.tables();

  const result = await db.coin.put({
    pk: userId,
    sk: idToSk(cuid()),
    networkId,
    token,
    title,
    contract,
    wallet,
  });
  return {
    id: skToId(result.sk),
    userId: result.pk,
    networkId: result.networkId,
    token: result.token,
    title: result.title,
    contract: result.contract,
    wallet: result.wallet,
  };
}

export async function deleteCoin({ id, userId }: Pick<Coin, "id" | "userId">) {
  const db = await arc.tables();
  return db.coin.delete({ pk: userId, sk: idToSk(id) });
}
