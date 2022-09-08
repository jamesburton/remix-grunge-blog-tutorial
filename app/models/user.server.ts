import arc from "@architect/functions";
import bcrypt from "bcryptjs";
import invariant from "tiny-invariant";

//export type User = { id: `email#${string}`; email: string };
export type User = { id: `email#${string}`; email: string, admin: boolean };
export type Password = { password: string };

export async function getUsers(): Promise<Array<User>> {
  const db = await arc.tables();

  // const result = await db.note.query({
  //   KeyConditionExpression: "pk = :pk",
  //   ExpressionAttributeValues: { ":pk": userId },
  // });
  // const result = await db.note.query({
  //   KeyConditionExpression: "pk <> :pk",
  //   ExpressionAttributeValues: { ":pk": '' }
  // });
  const result = await db.note.scan({
    //FilterExpression: "",
    ScanFilter: {
      //"pk": { ComparisonOperator: "NE", AttributeValueList: ["null"] }
      "pk": { ComparisonOperator: "NE", AttributeValueList: [""] }
    },
  });
  // console.log(result.Count ?? typeof result.Count);


  // return result.Items.map((n: any) => ({
  //   title: n.title,
  //   id: skToId(n.sk),
  // }));
  return result.Items;
}

export async function getUserById(id: User["id"]): Promise<User | null> {
  const db = await arc.tables();
  const result = await db.user.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": id },
  });

  const [record] = result.Items;
  // if (record) return { id: record.pk, email: record.email };
  if (record) return { id: record.pk, email: record.email, admin: !!record.admin };
  return null;
}

export async function getUserByEmail(email: User["email"]) {
  return getUserById(`email#${email}`);
}

async function getUserPasswordByEmail(email: User["email"]) {
  const db = await arc.tables();
  const result = await db.password.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": `email#${email}` },
  });

  const [record] = result.Items;

  if (record) return { hash: record.password };
  return null;
}

export async function createUser(
  email: User["email"],
  password: Password["password"],
  admin: User["admin"],
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const db = await arc.tables();
  await db.password.put({
    pk: `email#${email}`,
    password: hashedPassword,
  });

  await db.user.put({
    pk: `email#${email}`,
    email,
    admin,
  });

  const user = await getUserByEmail(email);
  invariant(user, `User not found after being created. This should not happen`);

  return user;
}

export async function deleteUser(email: User["email"]) {
  const db = await arc.tables();
  await db.password.delete({ pk: `email#${email}` });
  await db.user.delete({ pk: `email#${email}` });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["password"]
) {
  const userPassword = await getUserPasswordByEmail(email);

  if (!userPassword) {
    return undefined;
  }

  const isValid = await bcrypt.compare(password, userPassword.hash);
  if (!isValid) {
    return undefined;
  }

  return getUserByEmail(email);
}
