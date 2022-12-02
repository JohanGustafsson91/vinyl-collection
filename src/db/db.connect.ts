import { Db, MongoClient } from "mongodb";

import { throwChainedError } from "utils";

const { DB_NAME, DB_URI } = process.env;

if (![DB_NAME, DB_URI].every(Boolean)) {
  throw new Error("Define mongodb environment variables");
}

export async function connectToDatabase(): Promise<{
  readonly db: Db;
  readonly client: MongoClient;
}> {
  const client = new MongoClient(DB_URI ?? "", {});
  await client.connect().catch(throwChainedError("Client connection error"));
  const db = client.db(DB_NAME);

  return {
    client,
    db,
  };
}
