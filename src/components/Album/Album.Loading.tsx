import styled from "styled-components";
import { breakpoint, space } from "theme";

import { SkeletonItem } from "components/SkeletonLoading";

export const AlbumLoading = () => (
  <LoadingAlbumContainer>
    <SkeletonItem
      width={232}
      height={232}
      margin={`0 ${space(3)} ${space(3)} 0 `}
      id="image"
    />
    <LoadingAlbumTextContainer>
      <SkeletonItem width={232 / 3} height={16} margin={`0 0 ${space(2)} 0 `} />
      <SkeletonItem width={232 / 2} height={14} />
    </LoadingAlbumTextContainer>
  </LoadingAlbumContainer>
);

const LoadingAlbumContainer = styled.div`
  display: flex;
  flex-direction: row;
  cursor: pointer;

  #image {
    width: 100px;
    height: 100px;
  }

  ${breakpoint(1)} {
    flex-direction: column;

    #image {
      width: 232px;
      height: 232px;
    }
  }
`;

const LoadingAlbumTextContainer = styled.div``;
