interface RawFormat {
  name: string;
  qty: string;
  text?: string;
  descriptions: string[];
}

interface RawLabel {
  name: string;
  catno: string;
  entity_type: string;
  entity_type_name: string;
  id: number;
  resource_url: string;
}

interface RawArtist {
  name: string;
  anv: string;
  join: string;
  role: string;
  tracks: string;
  id: number;
  resource_url: string;
}

interface RawBasicInformation {
  id: number;
  master_id: number;
  master_url: string | null;
  resource_url: string;
  thumb: string;
  cover_image: string;
  title: string;
  year: number;
  formats: RawFormat[];
  labels: RawLabel[];
  artists: RawArtist[];
  genres: string[];
  styles?: string[];
}

interface RawImage {
  type: string;
  uri: string;
  resource_url: string;
  uri150: string;
  width: number;
  height: number;
}

interface RawExtraartist {
  name: string;
  anv: string;
  join: string;
  role: string;
  tracks: string;
  id: number;
  resource_url: string;
  thumbnail_url: string;
}

interface RawTracklist {
  position: string;
  type_: string;
  title: string;
  duration: string;
  extraartists?: RawExtraartist[];
}

interface RawArtist2 {
  name: string;
  anv: string;
  join: string;
  role: string;
  tracks: string;
  id: number;
  resource_url: string;
  thumbnail_url: string;
}

interface RawVideo {
  uri: string;
  title: string;
  description: string;
  duration: number;
  embed: boolean;
}

export interface RawMasterData {
  id: number;
  main_release: number;
  most_recent_release: number;
  resource_url: string;
  uri: string;
  versions_url: string;
  main_release_url: string;
  most_recent_release_url: string;
  num_for_sale: number;
  lowest_price: number;
  images: RawImage[];
  genres: string[];
  styles?: string[];
  year: number;
  tracklist: RawTracklist[];
  artists: RawArtist2[];
  title: string;
  notes?: string;
  data_quality: string;
  videos: RawVideo[];
}

export interface RawRelease {
  id: number;
  instance_id: number;
  date_added: string;
  rating: number;
  basic_information: RawBasicInformation;
  folder_id: number;
}

export interface RawReleaseWithMasterData extends RawRelease {
  masterData: RawMasterData | undefined;
}

export interface Raw {
  releases: RawRelease[];
}
