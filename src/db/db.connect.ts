import { Db, MongoClient, MongoClientOptions } from "mongodb";

const { DB_NAME, DB_URI } = process.env;

if (![DB_NAME, DB_URI].every(Boolean)) {
  throw new Error("Define mongodb environment variables");
}

const cache = {
  client: undefined,
  db: undefined,
};

export async function connectToDatabase(): Promise<{
  db: Db;
  client: MongoClient;
}> {
  console.time(connectToDatabase.name);

  if (Object.values(cache).every(Boolean)) {
    console.log("[DATABASE CACHED]");
    console.timeEnd(connectToDatabase.name);

    return {
      client: cache.client,
      db: cache.db,
    };
  }

  const options: MongoClientOptions = {};

  const client = new MongoClient(DB_URI, options);
  await client.connect();

  const db = client.db(DB_NAME);

  cache.client = client;
  cache.db = db;

  console.timeEnd(connectToDatabase.name);

  return {
    client: cache.client,
    db: cache.db,
  };
}
