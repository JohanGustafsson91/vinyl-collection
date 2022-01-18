import styled, { css } from "styled-components";
import { breakpoint, fontSize, space } from "theme";

export const DetailsPage = styled.div<{ isActive: boolean }>`
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

export const DetailsHeader = styled.div`
  display: flex;
  margin-bottom: ${space(3)};
  padding-bottom: ${space(3)};
`;

export const DetailsCover = styled.img`
  width: auto;
  height: 100px;

  ${breakpoint(1)} {
    width: 232px;
    height: 232px;
  }
`;

export const DetailsLabel = styled.span`
  display: block;
  font-size: ${fontSize(0)};
  color: var(--color-detail-text);
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: ${space(3)};
`;

export const DetailsArtist = styled.span`
  font-weight: bold;
  line-height: 1;
  margin-bottom: ${space(2)};
  color: var(--color-detail-text);
`;

export const DetailsTrackList = styled.ol`
  padding-left: ${space(3)};
`;

export const DetailsTextContent = styled.div`
  padding: 0 ${space(3)};
  display: flex;
  flex-direction: column;
`;

export const DetailsSecondaryLabel = styled.span`
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

export const DetailsTrack = styled.li`
  color: var(--color-text-secondary);
  margin-bottom: ${space(2)};
  font-size: ${fontSize(1)};

  &:last-child {
    margin-bottom: ${space(4)};
  }
`;

export const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  grid-column-gap: ${space(3)};

  ${breakpoint(1)} {
    grid-template-columns: repeat(2, 1fr);
  }
`;
