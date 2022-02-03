import { FormattedAlbum, getAlbums } from "api/albums";
import { NextApiRequest, NextApiResponse } from "next";

import { catchChainedError } from "utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FormattedAlbum[]>
) {
  const albums = await getAlbums().catch(
    catchChainedError("Could not get albums")
  );

  if (albums instanceof Error) {
    return res.status(500);
  }

  res.status(200).json(albums);
}
