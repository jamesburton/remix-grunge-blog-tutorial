import arc from "@architect/functions";
import cuid from "cuid";

import type { User } from "./user.server";

export type Network = {
  id: ReturnType<typeof cuid>;
  userId: User["id"];
  title: string;
  url: string;
  isTest: boolean;
};

type NetworkItem = {
  pk: User["id"];
  sk: `network#${Network["id"]}`;
};

const skToId = (sk: NetworkItem["sk"]): Network["id"] => sk.replace(/^network#/, "");
const idToSk = (id: Network["id"]): NetworkItem["sk"] => `network#${id}`;

export async function getNetwork({
  id,
  userId,
}: Pick<Network, "id" | "userId">): Promise<Network | null> {
  const db = await arc.tables();

  const result = await db.network.get({ pk: userId, sk: idToSk(id) });

  if (result) {
    return {
      userId: result.pk,
      id: result.sk,
      title: result.title,
      url: result.url,
      isTest: result.isTest,
    };
  }
  return null;
}

export async function getNetworkListItems({
  userId,
}: Pick<Network, "userId">): Promise<Array<Pick<Network, "id" | "title" | "url" | "isTest">>> {
  const db = await arc.tables();

  const result = await db.network.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": userId },
  });

  return result.Items.map((n: any) => ({
    title: n.title,
    id: skToId(n.sk),
    url: n.url,
    isTest: n.isTest,
  }));
}

export async function createNetwork({
  title,
  userId,
  url,
  isTest,
}: Pick<Network, "title" | "userId" | "url" | "isTest">): Promise<Network> {
  const db = await arc.tables();

  const result = await db.network.put({
    pk: userId,
    sk: idToSk(cuid()),
    title,
    url,
    isTest,
  });
  return {
    id: skToId(result.sk),
    userId: result.pk,
    title: result.title,
    url: result.url,
    isTest: result.isTest,
  };
}

export async function updateNetwork({
  id,
  title,
  userId,
  url,
  isTest,
}: Pick<Network, "id" | "title" | "userId" | "url" | "isTest">): Promise<Network> {
  const db = await arc.tables();

  const result = await db.network.put({
    pk: userId,
    sk: idToSk(id),
    title,
    url,
    isTest,
  });
  return {
    id: skToId(result.sk),
    userId: result.pk,
    title: result.title,
    url: result.url,
    isTest: result.isTest,
  };
}

export async function deleteNetwork({ id, userId }: Pick<Network, "id" | "userId">) {
  const db = await arc.tables();
  return db.network.delete({ pk: userId, sk: idToSk(id) });
}
