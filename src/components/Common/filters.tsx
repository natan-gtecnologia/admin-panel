import React, { ReactNode } from 'react';
import { Input } from 'reactstrap';

type FilterProps = {
  column: {
    render: (filter: any) => ReactNode;
    canFilter: boolean;
  };
};

type DefaultColumnFilterProps = {
  column: {
    filterValue: any;
    setFilter: (filterValue: any) => void;
    preFilteredRows: any;
  };
};

type SelectColumnFilterProps = {
  column: {
    filterValue: string;
    setFilter: (filterValue: string) => void;
    preFilteredRows: {
      values: Record<string, string>;
    }[];
    id: string;
  };
};

export const Filter = ({ column }: FilterProps) => {
  return (
    <div style={{ marginTop: 5 }}>
      {column.canFilter && column.render('Filter')}
    </div>
  );
};

export const DefaultColumnFilter = ({
  column: {
    filterValue,
    setFilter,
    preFilteredRows: { length },
  },
}: DefaultColumnFilterProps) => {
  return (
    <Input
      value={filterValue || ''}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
      placeholder={`search (${length}) ...`}
    />
  );
};

export const SelectColumnFilter = ({
  column: { filterValue, setFilter, preFilteredRows, id },
}: SelectColumnFilterProps) => {
  const options = React.useMemo(() => {
    const options = new Set<string>();
    preFilteredRows.forEach((row) => {
      const option = row.values[id];
      options.add(option);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  return (
    <select
      id="custom-select"
      className="form-select"
      value={filterValue}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
    >
      <option value="">All</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};
