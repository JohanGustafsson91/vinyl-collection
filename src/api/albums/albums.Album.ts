export interface FormattedAlbum {
  id: number;
  artist: string;
  title: string;
  printedYear: number;
  releasedYear?: number;
  thumbnail: string;
  coverImage: string;
  format: string;
  numberOfDiscs: string;
  label: string;
  labelCategoryNumber: string;
  genres: string[];
  tracks: FormattedTrack[];
  videos: FormattedVideo[];
}

type FormattedTrack = {
  title: string;
  position: string;
  duration: string;
};

type FormattedVideo = {
  url: string;
  title: string;
};
