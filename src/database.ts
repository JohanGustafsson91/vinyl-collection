import { MongoClient } from "mongodb";

import { throwChainedError } from "shared/handleErrors";

const { DB_NAME = "", DB_URI = "" } = process.env;

export const COLLECTION_ALBUMS = "albums";

export async function connectToDatabase(
  params: {
    readonly url: string;
    readonly dbName: string;
  } = {
    url: DB_URI,
    dbName: DB_NAME,
  }
) {
  const client = new MongoClient(params.url, {});
  await client.connect().catch(throwChainedError("Client connection error"));
  const db = client.db(params.dbName);

  return {
    client,
    db,
  };
}
