import styled from "styled-components";
import { breakpoint } from "theme";

export const Cover = styled.div<{ invisible?: boolean }>`
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
