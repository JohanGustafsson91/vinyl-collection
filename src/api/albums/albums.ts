import { Db } from "mongodb";

import { throwChainedError } from "utils";

import type { RawReleaseWithMasterData } from ".";

export const COLLECTION_ALBUMS = "albums";

export async function getStoredAlbumsFromDb({
  db,
  collection = COLLECTION_ALBUMS,
}: {
  readonly db: Db;
  readonly collection?: string;
}) {
  const storedAlbums = await db
    .collection(collection)
    .find({})
    .toArray()
    .catch(throwChainedError("Could not get collections from database"));

  return storedAlbums as unknown as readonly RawReleaseWithMasterData[];
}
