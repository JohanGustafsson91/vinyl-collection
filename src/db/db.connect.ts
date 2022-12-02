import { Db, MongoClient } from "mongodb";

import { throwChainedError } from "utils";

const { DB_NAME = "", DB_URI = "" } = process.env;

export async function connectToDatabase(
  params: {
    readonly url: string;
    readonly dbName: string;
  } = {
    url: DB_URI,
    dbName: DB_NAME,
  }
): Promise<{
  readonly db: Db;
  readonly client: MongoClient;
}> {
  const client = new MongoClient(params.url, {});
  await client.connect().catch(throwChainedError("Client connection error"));
  const db = client.db(params.dbName);

  return {
    client,
    db,
  };
}
