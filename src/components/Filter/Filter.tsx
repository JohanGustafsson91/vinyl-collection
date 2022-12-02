import { useEffect, useReducer, useState } from "react";
import styled from "styled-components";
import { fontSize, space } from "theme";

export function Filter({ onFilter }: Props) {
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

  const debouncedQuery = useDebounced({ query: filter.query, timeout: 500 });

  useEffect(
    function callBackWhenChangedFilter() {
      return onFilter({
        query: debouncedQuery,
        includeTrack: filter.includeTrack,
      });
    },
    [debouncedQuery, filter.includeTrack, onFilter]
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
        type="text"
        name="query"
        placeholder="Filter albums"
        value={filter.query}
        onKeyDown={handleKeyDownEvent}
        onChange={handleFilter}
      />
      <Label>
        <Checkbox
          type="checkbox"
          name="includeTrack"
          checked={filter.includeTrack}
          onChange={handleFilter}
        />
        <span>Tracks</span>
      </Label>
    </div>
  );
}

const useDebounced = ({
  query,
  timeout,
}: {
  readonly query: string;
  readonly timeout: number;
}) => {
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
  background: var(--color-background-input);
  padding: ${space(3)};
  border: 0;
  border-radius: ${space(3)};
  margin-right: ${space(3)};
  outline: 0;
`;

const Label = styled.label`
  white-space: nowrap;
  font-weight: 500;
  font-size: ${fontSize(0)};
  display: inline-flex;
  align-items: center;
`;

const Checkbox = styled.input`
  margin-right: ${space(2)};
  padding: ${space(2)};
`;

interface Props {
  // eslint-disable-next-line functional/no-return-void
  readonly onFilter: (arg: FilterOptions) => void;
}

export interface FilterOptions {
  readonly query: string;
  readonly includeTrack: boolean;
}
