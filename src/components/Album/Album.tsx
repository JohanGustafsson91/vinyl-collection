import {
  MouseEvent,
  MutableRefObject,
  TouchEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { AlbumType } from "api/albums";
import styled from "styled-components";
import { breakpoint, fontSize, space } from "theme";

import {
  DetailsArtist,
  DetailsCover,
  DetailsGrid,
  DetailsHeader,
  DetailsLabel,
  DetailsPage,
  DetailsSecondaryLabel,
  DetailsTextContent,
  DetailsTrack,
  DetailsTrackList,
} from ".";

export const Album = ({ album }: Props) => {
  const [detailsViewVisible, setIsDetailViewVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(ref, function handleClickOutside(e) {
    if (detailsViewVisible) {
      e.preventDefault();
      e.stopPropagation();
      setIsDetailViewVisible(false);
    }
  });

  useEffect(
    function disableBodyScoll() {
      document.body.style.overflow = detailsViewVisible ? "hidden" : "visible";
    },
    [detailsViewVisible]
  );

  function handleShowDetailsView() {
    return !detailsViewVisible && setIsDetailViewVisible(true);
  }

  return (
    <Container tabIndex={0} onClick={handleShowDetailsView}>
      <Cover src={album.coverImage} />
      <TextContent>
        <Artist>{album.artist}</Artist>
        <Title>
          {album.title}, {album.releasedYear}
        </Title>
      </TextContent>

      <DetailsPage isActive={detailsViewVisible} ref={ref}>
        {detailsViewVisible && (
          <>
            <DetailsHeader>
              <DetailsCover src={album.coverImage} />
              <DetailsTextContent>
                <DetailsArtist>{album.artist}</DetailsArtist>
                <DetailsSecondaryLabel>{album.title}</DetailsSecondaryLabel>
              </DetailsTextContent>
            </DetailsHeader>

            <DetailsGrid>
              <div>
                <DetailsLabel>Release</DetailsLabel>
                <DetailsSecondaryLabel>
                  {album.releasedYear}
                </DetailsSecondaryLabel>
              </div>
              <div>
                <DetailsLabel>Label</DetailsLabel>
                <DetailsSecondaryLabel>
                  {album.label}, {album.labelCategoryNumber}
                </DetailsSecondaryLabel>
              </div>
              <div>
                <DetailsLabel>Printed</DetailsLabel>
                <DetailsSecondaryLabel>
                  {album.printedYear}
                </DetailsSecondaryLabel>
              </div>
              <div>
                <DetailsLabel>Format</DetailsLabel>
                <DetailsSecondaryLabel>{album.format}</DetailsSecondaryLabel>
              </div>
              <div>
                <DetailsLabel>Genre</DetailsLabel>
                {album.genres.map(function renderGenre(genre) {
                  return (
                    <DetailsSecondaryLabel key={genre}>
                      {genre}
                    </DetailsSecondaryLabel>
                  );
                })}
              </div>
            </DetailsGrid>

            <DetailsGrid>
              <div>
                <DetailsLabel>Tracklist</DetailsLabel>

                <DetailsTrackList>
                  {album.tracks.map(function renderTrack(track) {
                    return (
                      <DetailsTrack key={track.title}>
                        {track.title}
                      </DetailsTrack>
                    );
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
        )}
      </DetailsPage>
      {detailsViewVisible && <Overlay />}
    </Container>
  );
};

interface Props {
  album: AlbumType;
}

function useOnClickOutside(
  ref: MutableRefObject<HTMLDivElement>,
  handler: (e: MouseEvent | TouchEvent) => void
) {
  useEffect(
    function addEventListeners() {
      const listener = (event: any) => {
        const clickedOutside = !ref?.current?.contains(event.target);
        clickedOutside && handler(event);
      };

      document.addEventListener("mousedown", listener);
      document.addEventListener("touchstart", listener, { passive: false });

      return function cleanUp() {
        document.removeEventListener("mousedown", listener);
        document.removeEventListener("touchstart", listener);
      };
    },
    [ref, handler]
  );
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--zIndex-overlay);
  background-color: rgba(0, 0, 0, 0.5);
`;

const Cover = styled.img`
  width: auto;
  height: 100px;
  margin-bottom: ${space(3)};
  transition: all 0.3s ease-in-out 0s;

  ${breakpoint(1)} {
    width: 232px;
    height: 232px;
  }
`;

const Container = styled.article`
  display: flex;
  flex-direction: row;
  cursor: pointer;

  &:hover {
    ${Cover} {
      transform: scale(1.02) rotateZ(1deg);
    }
  }

  ${breakpoint(1)} {
    flex-direction: column;
  }
`;

const Artist = styled.span`
  font-weight: bold;
  line-height: 1;
  margin-bottom: ${space(2)};
`;

const Title = styled.span`
  font-size: ${fontSize(1)};
  color: var(--color-text-secondary);
  line-height: 1;
`;

const TextContent = styled.div`
  padding: 0 ${space(3)};
  display: flex;
  flex-direction: column;

  ${breakpoint(1)} {
    padding: 0;
  }
`;
