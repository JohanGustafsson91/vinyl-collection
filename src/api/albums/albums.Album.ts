export interface AlbumType {
  id: number;
  artist: string;
  title: string;
  printedYear: number;
  releasedYear: number;
  thumbnail: string;
  coverImage: string;
  format: string;
  numberOfDiscs: string;
  label: string;
  labelCategoryNumber: string;
  genres: string[];
  tracks: Track[];
  videos: Video[];
}

export type Track = {
  title: string;
  position: string;
  duration: string;
};

type Video = {
  url: string;
  title: string;
};
