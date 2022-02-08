import { FormattedAlbum, getAlbums, getAlbumsFromDatabase } from "api/albums";
import { NextApiRequest, NextApiResponse } from "next";

import { catchChainedError, logger } from "utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FormattedAlbum[]>
) {
  const { syncCollection } = req.query;

  const getFn = syncCollection !== "false" ? getAlbums : getAlbumsFromDatabase;

  const albums = await getFn().catch(catchChainedError("Could not get albums"));

  if (albums instanceof Error) {
    logger.error(albums.message);
    return res.status(500);
  }

  res.status(200).json(albums);
}
