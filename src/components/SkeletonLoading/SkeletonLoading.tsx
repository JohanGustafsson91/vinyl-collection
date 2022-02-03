import styled, { keyframes } from "styled-components";

const loadingAnimation = keyframes`
0% {
  transform: translateX(0);
}
50%,
100% {
  transform: translateX(400px);
}
`;

export const SkeletonItem = styled.div<{
  height?: number;
  width?: number;
  inline?: boolean;
  margin?: string;
}>`
  display: ${(props) => (props.inline ? "inline-block" : "block")};
  width: ${(props) => (props.width ? `${props.width}px` : "auto")};
  height: ${(props) => (props.height ? `${props.height}px` : "auto")};
  background-color: #605f76;
  overflow: hidden;
  position: relative;
  margin: ${(props) => props.margin ?? 0};

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: ${(props) => (props.width ? `${props.width}px` : "auto")};
    height: 100%;
    background: linear-gradient(to right, #605f76, #ddd, #f2f2f2);
    animation: ${loadingAnimation} 1.5s infinite linear;
  }
`;
