import { FormattedAlbum } from "api/albums";
import Image from "next/image";
import styled from "styled-components";
import { breakpoint, fontSize, space } from "theme";

const AlbumDetails = ({ album }: { album: FormattedAlbum }) => (
  <>
    <DetailsHeader>
      <DetailsCover
        src={album.coverImage}
        alt={`${album.artist} cover image`}
        width={232}
        height={232}
      />
      <DetailsTextContent>
        <DetailsArtist>{album.artist}</DetailsArtist>
        <DetailsSecondaryLabel>{album.title}</DetailsSecondaryLabel>
      </DetailsTextContent>
    </DetailsHeader>

    <DetailsGrid>
      <div>
        <DetailsLabel>Release</DetailsLabel>
        <DetailsSecondaryLabel>{album.releasedYear}</DetailsSecondaryLabel>
      </div>
      <div>
        <DetailsLabel>Label</DetailsLabel>
        <DetailsSecondaryLabel>
          {album.label}, {album.labelCategoryNumber}
        </DetailsSecondaryLabel>
      </div>
      <div>
        <DetailsLabel>Printed</DetailsLabel>
        <DetailsSecondaryLabel>{album.printedYear}</DetailsSecondaryLabel>
      </div>
      <div>
        <DetailsLabel>Format</DetailsLabel>
        <DetailsSecondaryLabel>{album.format}</DetailsSecondaryLabel>
      </div>
      <div>
        <DetailsLabel>Genre</DetailsLabel>
        {album.genres.map(function renderGenre(genre) {
          return (
            <DetailsSecondaryLabel key={genre}>{genre}</DetailsSecondaryLabel>
          );
        })}
      </div>
    </DetailsGrid>

    <DetailsGrid>
      <div>
        <DetailsLabel>Tracklist</DetailsLabel>

        <DetailsTrackList>
          {album.tracks.map(function renderTrack(track) {
            return <DetailsTrack key={track.title}>{track.title}</DetailsTrack>;
          })}
        </DetailsTrackList>
      </div>

      <div>
        <DetailsLabel>Videos</DetailsLabel>

        <DetailsTrackList>
          {album.videos.map(function renderLinkToVideo(video) {
            return (
              <DetailsTrack key={video.title + video.url}>
                <a href={video.url} target="_blank" rel="noreferrer">
                  {video.title}
                </a>
              </DetailsTrack>
            );
          })}
        </DetailsTrackList>
      </div>
    </DetailsGrid>
  </>
);

export default AlbumDetails;

const DetailsHeader = styled.div`
  display: flex;
  margin-bottom: ${space(3)};
  padding-bottom: ${space(3)};
`;

const DetailsCover = styled(Image)`
  width: 100px;
  min-width: 100px;
  height: 100px;

  ${breakpoint(1)} {
    width: 232px;
    height: 232px;
  }
`;

const DetailsLabel = styled.span`
  display: block;
  font-size: ${fontSize(0)};
  color: var(--color-detail-text);
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: ${space(3)};
`;

const DetailsArtist = styled.span`
  font-weight: bold;
  line-height: 1;
  margin-bottom: ${space(2)};
  color: var(--color-detail-text);
`;

const DetailsTrackList = styled.ol`
  padding-left: ${space(3)};
`;

const DetailsTextContent = styled.div`
  padding: 0 ${space(3)};
  display: flex;
  flex-direction: column;
`;

const DetailsSecondaryLabel = styled.span`
  color: var(--color-text-secondary);
  text-transform: uppercase;
  display: block;
  font-weight: 500;
  font-size: ${fontSize(1)};
  margin-bottom: ${space(2)};

  &:last-child {
    margin-bottom: ${space(4)};
  }
`;

const DetailsTrack = styled.li`
  color: var(--color-text-secondary);
  margin-bottom: ${space(2)};
  font-size: ${fontSize(1)};

  &:last-child {
    margin-bottom: ${space(4)};
  }
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  grid-column-gap: ${space(3)};

  ${breakpoint(1)} {
    grid-template-columns: repeat(2, 1fr);
  }
`;
