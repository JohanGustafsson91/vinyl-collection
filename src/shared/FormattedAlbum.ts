export interface FormattedAlbum {
  readonly id: number;
  readonly artist: string;
  readonly title: string;
  readonly printedYear: number;
  readonly releasedYear: number | null;
  readonly thumbnail: string;
  readonly coverImage: string;
  readonly format: string;
  readonly numberOfDiscs: string;
  readonly label: string;
  readonly labelCategoryNumber: string;
  readonly genres: readonly string[];
  readonly tracks: readonly FormattedTrack[];
  readonly videos: readonly FormattedVideo[];
}

type FormattedTrack = {
  readonly title: string;
  readonly position: string;
  readonly duration: string;
};

type FormattedVideo = {
  readonly url: string;
  readonly title: string;
};
