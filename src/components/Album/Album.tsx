import {
  MouseEvent,
  MutableRefObject,
  TouchEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import styled, { css } from "styled-components";
import { breakpoint, space } from "theme";

import { FormattedAlbum } from "shared/FormattedAlbum";

import { AlbumDetails } from "./Album.Details";

export function Album({ album }: Props) {
  const [detailViewVisibility, setDetailViewVisibility] =
    useState<Visibility>("hidden");

  const refDetailView = useRef<HTMLDivElement | null>(null);

  useOnClickOutside({
    element: refDetailView,
    callback: function handleClickOutside(e) {
      if (detailViewVisibility === "visible") {
        e.preventDefault();
        e.stopPropagation();
        return setDetailViewVisibility("hidden");
      }
    },
  });

  useEffect(
    function disableBodyScoll() {
      // eslint-disable-next-line functional/immutable-data
      document.body.style.overflow = { visible: "hidden", hidden: "visible" }[
        detailViewVisibility
      ];
    },
    [detailViewVisibility]
  );

  function handleShowDetailsView(_e: MouseEvent<HTMLElement>) {
    return setDetailViewVisibility("visible");
  }

  return (
    <Container tabIndex={0} onClick={handleShowDetailsView}>
      <Cover>
        <Image
          src={album.coverImage}
          alt={`${album.artist} - ${album.title} (${album.releasedYear}) cover image`}
          style={{ width: "100%", height: "100%" }}
          width={200}
          height={200}
        />
      </Cover>

      <DetailsPage visibility={detailViewVisibility} ref={refDetailView}>
        {
          { visible: <AlbumDetails album={album} />, hidden: null }[
            detailViewVisibility
          ]
        }
      </DetailsPage>
      {{ visible: <Overlay />, hidden: null }[detailViewVisibility]}
    </Container>
  );
}

function useOnClickOutside({
  element,
  callback,
}: {
  readonly element: MutableRefObject<HTMLDivElement | null>;
  readonly callback: (_e: MouseEvent | TouchEvent) => unknown;
}) {
  useEffect(
    function addEventListeners() {
      const listener = (event: any) => {
        const clickedOutside = !element?.current?.contains(event.target);
        clickedOutside && callback(event);
      };

      document.addEventListener("mousedown", listener);
      document.addEventListener("touchstart", listener, { passive: false });

      return function cleanUp() {
        document.removeEventListener("mousedown", listener);
        document.removeEventListener("touchstart", listener);
      };
    },
    [element, callback]
  );
}

const DetailsPage = styled.div<{ readonly visibility: Visibility }>`
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

  ${({ visibility }) =>
    visibility === "visible" &&
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

const Cover = styled.div`
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
`;

interface Props {
  readonly album: FormattedAlbum;
}

type Visibility = "visible" | "hidden";
