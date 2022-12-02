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
import Image from "next/image";
import styled, { css } from "styled-components";
import { breakpoint, space } from "theme";

import { FormattedAlbum } from "shared/FormattedAlbum";

const loadAlbumDetailsComponent = () => import("./Album.Details");
const AlbumDetails = lazy(loadAlbumDetailsComponent);

export function Album({ album }: Props) {
  const [detailsViewVisible, setIsDetailViewVisible] = useState(false);
  const refDetailsPage = useRef<HTMLDivElement | null>(null);

  useOnClickOutside({
    ref: refDetailsPage,
    callback: function handleClickOutside(e) {
      if (detailsViewVisible) {
        e.preventDefault();
        e.stopPropagation();
        return setIsDetailViewVisible(false);
      }
    },
  });

  useEffect(
    function disableBodyScoll() {
      // eslint-disable-next-line functional/immutable-data
      document.body.style.overflow = detailsViewVisible ? "hidden" : "visible";
    },
    [detailsViewVisible]
  );

  function handleShowDetailsView(_e: MouseEvent<HTMLElement>) {
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
          style={{ width: "100%", height: "100%" }}
          width={200}
          height={200}
        />
      </Cover>

      <DetailsPage isActive={detailsViewVisible} ref={refDetailsPage}>
        {detailsViewVisible ? (
          <Suspense fallback={<div>Loading...</div>}>
            <AlbumDetails album={album} />
          </Suspense>
        ) : null}
      </DetailsPage>
      {detailsViewVisible ? <Overlay /> : null}
    </Container>
  );
}

function useOnClickOutside({
  ref,
  callback,
}: {
  readonly ref: MutableRefObject<HTMLDivElement | null>;
  readonly callback: (_e: MouseEvent | TouchEvent) => unknown;
}) {
  useEffect(
    function addEventListeners() {
      const listener = (event: any) => {
        const clickedOutside = !ref?.current?.contains(event.target);
        clickedOutside && callback(event);
      };

      document.addEventListener("mousedown", listener);
      document.addEventListener("touchstart", listener, { passive: false });

      return function cleanUp() {
        document.removeEventListener("mousedown", listener);
        document.removeEventListener("touchstart", listener);
      };
    },
    [ref, callback]
  );
}

const DetailsPage = styled.div<{ readonly isActive: boolean }>`
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

  ${({ isActive }) =>
    isActive &&
    css`
      visibility: visible;
      left: calc(100% / 6);

      ${breakpoint(1)} {
        left: 50%;
      }
    `}
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

const Cover = styled.div<{ readonly invisible?: boolean }>`
  position: relative;
  transition: all 0.2s linear;
  z-index: var(--zIndex-cover);
  width: 120px;
  height: 120px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;

  ${breakpoint(0)} {
    width: 200px;
    height: 200px;
  }

  &:hover {
    transform: translateY(10px);
    box-shadow: rgba(0, 0, 0, 0.2) 7px -5px 15px;
    cursor: pointer;
  }

  ${(props) =>
    props.invisible &&
    `
  box-shadow: none;
  cursor: none;
`}
`;

interface Props {
  readonly album: FormattedAlbum;
}
