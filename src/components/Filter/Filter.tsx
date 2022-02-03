import { useEffect, useReducer, useRef, useState } from "react";
import styled from "styled-components";
import { space } from "theme";

export const Filter = ({ onFilter, disabled }: Props) => {
  const [filter, setFilter] = useReducer(
    (prevState: FilterOptions, newPartialState: Partial<FilterOptions>) => ({
      ...prevState,
      ...newPartialState,
    }),
    {
      query: "",
      includeTrack: true,
    }
  );

  const debouncedQuery = useDebounced(filter.query, 500);
  const refCallbackFunctionOnFilter = useRef(onFilter);

  useEffect(
    function callBackWhenChangedFilter() {
      refCallbackFunctionOnFilter.current({
        query: debouncedQuery,
        includeTrack: filter.includeTrack,
      });
    },
    [debouncedQuery, filter.includeTrack]
  );

  function handleKeyDownEvent(e: React.KeyboardEvent<HTMLInputElement>) {
    return e.key === "Escape" && setFilter({ query: "" });
  }

  function handleFilter(e: React.ChangeEvent<HTMLInputElement>) {
    return setFilter({
      [e.target.name]: e.target[e.target.type === "text" ? "value" : "checked"],
    });
  }

  return (
    <div>
      <Input
        name="query"
        placeholder="Filter albums"
        value={filter.query}
        onKeyDown={handleKeyDownEvent}
        onChange={handleFilter}
        disabled={disabled}
      />
      <Label>
        <Checkbox
          name="includeTrack"
          checked={filter.includeTrack}
          onChange={handleFilter}
          disabled={disabled}
        />
        <span>Tracks</span>
      </Label>
    </div>
  );
};

interface Props {
  onFilter: (arg: FilterOptions) => void;
  disabled: boolean;
}

export type FilterOptions = {
  query: string;
  includeTrack: boolean;
};

const useDebounced = (query: string, timeout: number) => {
  const [value, setValue] = useState(query);

  useEffect(
    function startTimer() {
      const id = setTimeout(function handleTimeout() {
        setValue(query);
      }, timeout);

      return function cleanUp() {
        return clearTimeout(id);
      };
    },
    [timeout, query]
  );

  return value;
};

const Input = styled.input`
  margin-right: ${space(3)};
`;
Input.defaultProps = {
  type: "text",
};

const Label = styled.label`
  white-space: nowrap;
`;

const Checkbox = styled.input`
  margin-right: ${space(2)};
`;
Checkbox.defaultProps = {
  type: "checkbox",
};
