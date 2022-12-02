/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/functional-parameters */
import { rest } from "msw";

import { Raw, RawMasterData } from "shared/Release";

import mockDataReleases from "./releasesMockData.json";

export const getReleases = rest.get<{}, {}, Raw>(
  "https://api.discogs.com/users/*",
  function resolver(_, res, ctx) {
    const albums = [...mockDataReleases.releases].map(function immutable(a) {
      return {
        ...a,
      };
    });

    albums.forEach(function cleanMasterData(album) {
      // @ts-expect-error Master data is not included in real response
      delete album["masterData"];
    });

    return res(
      ctx.status(200),
      ctx.json({
        ...mockDataReleases,
        releases: albums,
      })
    );
  }
);

export const getMasterData = rest.get<
  {},
  { readonly releaseId: string },
  RawMasterData | Partial<RawMasterData>
>(
  "https://api.discogs.com/masters/:releaseId",
  function resolver(req, res, ctx) {
    const { releaseId } = req.params;

    const found = mockDataReleases.releases.find(function masterData(release) {
      return release.basic_information.master_id.toString() === releaseId;
    });

    return res(
      ctx.json(
        found
          ? found.masterData
          : {
              tracklist: [],
              videos: [],
              year: 1900,
            }
      )
    );
  }
);
