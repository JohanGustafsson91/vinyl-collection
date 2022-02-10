import {
  lazy,
  MouseEvent,
  MutableRefObject,
  Suspense,
  TouchEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { FormattedAlbum } from "api/albums";
import Image from "next/image";
import styled, { css } from "styled-components";
import { breakpoint, space } from "theme";

import { Cover } from "./Album.Cover";

const loadAlbumDetailsComponent = () => import("./Album.Details");
const AlbumDetails = lazy(loadAlbumDetailsComponent);

const Album = ({ album }: Props) => {
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
    <Container
      tabIndex={0}
      onClick={handleShowDetailsView}
      onMouseEnter={loadAlbumDetailsComponent}
      onFocus={loadAlbumDetailsComponent}
    >
      <Cover>
        <Image
          src={album.coverImage}
          alt={`${album.artist} cover image`}
          width={200}
          height={200}
          layout="intrinsic"
        />
      </Cover>

      <DetailsPage isActive={detailsViewVisible} ref={ref}>
        {detailsViewVisible && (
          <Suspense fallback={<div>Loading...</div>}>
            <AlbumDetails album={album} />
          </Suspense>
        )}
      </DetailsPage>
      {detailsViewVisible && <Overlay />}
    </Container>
  );
};

export default Album;

interface Props {
  album: FormattedAlbum;
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

const DetailsPage = styled.div<{ isActive: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  left: 100%;
  bottom: 0;
  overflow: auto;
  background-color: #fff;
  transition: all 0.5s ease 0s;
  padding: ${space(4)};
  display: flex;
  flex-direction: column;
  z-index: var(--zIndex-popup);
  visibility: hidden;

  ${function applyActiveStyle({ isActive }) {
    return (
      isActive &&
      css`
        visibility: visible;
        left: calc(100% / 6);

        ${breakpoint(1)} {
          left: 50%;
        }
      `
    );
  }}
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--zIndex-overlay);
  background-color: rgba(0, 0, 0, 0.5);
`;

const Container = styled.article`
  outline: 0;
`;
