interface RawFormat {
  readonly name: string;
  readonly qty: string;
  readonly text?: string;
  readonly descriptions: readonly string[];
}

interface RawLabel {
  readonly name: string;
  readonly catno: string;
  readonly entity_type: string;
  readonly entity_type_name: string;
  readonly id: number;
  readonly resource_url: string;
}

interface RawArtist {
  readonly name: string;
  readonly anv: string;
  readonly join: string;
  readonly role: string;
  readonly tracks: string;
  readonly id: number;
  readonly resource_url: string;
}

interface RawBasicInformation {
  readonly id: number;
  readonly master_id: number;
  readonly master_url: string | null;
  readonly resource_url: string;
  readonly thumb: string;
  readonly cover_image: string;
  readonly title: string;
  readonly year: number;
  readonly formats: readonly RawFormat[];
  readonly labels: readonly RawLabel[];
  readonly artists: readonly RawArtist[];
  readonly genres: readonly string[];
  readonly styles?: readonly string[];
}

interface RawImage {
  readonly type: string;
  readonly uri: string;
  readonly resource_url: string;
  readonly uri150: string;
  readonly width: number;
  readonly height: number;
}

interface RawExtraartist {
  readonly name: string;
  readonly anv: string;
  readonly join: string;
  readonly role: string;
  readonly tracks: string;
  readonly id: number;
  readonly resource_url: string;
  readonly thumbnail_url: string;
}

interface RawTracklist {
  readonly position: string;
  readonly type_: string;
  readonly title: string;
  readonly duration: string;
  readonly extraartists?: readonly RawExtraartist[];
}

interface RawArtist2 {
  readonly name: string;
  readonly anv: string;
  readonly join: string;
  readonly role: string;
  readonly tracks: string;
  readonly id: number;
  readonly resource_url: string;
  readonly thumbnail_url: string;
}

interface RawVideo {
  readonly uri: string;
  readonly title: string;
  readonly description: string;
  readonly duration: number;
  readonly embed: boolean;
}

export interface RawMasterData {
  readonly id: number;
  readonly main_release: number;
  readonly most_recent_release: number;
  readonly resource_url: string;
  readonly uri: string;
  readonly versions_url: string;
  readonly main_release_url: string;
  readonly most_recent_release_url: string;
  readonly num_for_sale: number;
  readonly lowest_price: number;
  readonly images: readonly RawImage[];
  readonly genres: readonly string[];
  readonly styles?: readonly string[];
  readonly year: number;
  readonly tracklist: readonly RawTracklist[];
  readonly artists: readonly RawArtist2[];
  readonly title: string;
  readonly notes?: string;
  readonly data_quality: string;
  readonly videos: readonly RawVideo[];
}

export interface RawRelease {
  readonly id: number;
  readonly instance_id: number;
  readonly date_added: string;
  readonly rating: number;
  readonly basic_information: RawBasicInformation;
  readonly folder_id: number;
}

export interface RawReleaseWithMasterData extends RawRelease {
  readonly masterData: RawMasterData | undefined;
}

export interface Raw {
  readonly releases: readonly RawRelease[];
}
