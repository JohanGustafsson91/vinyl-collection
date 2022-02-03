import { FormattedAlbum, getAlbums } from "api/albums";
import { NextApiRequest, NextApiResponse } from "next";

import { catchChainedError, logger } from "utils";

export default async function handler(
  _: NextApiRequest,
  res: NextApiResponse<FormattedAlbum[]>
) {
  const albums = await getAlbums().catch(
    catchChainedError("Could not get albums")
  );

  if (albums instanceof Error) {
    logger.error(albums.message);
    return res.status(500);
  }

  res.status(200).json(albums);
}
