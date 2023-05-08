import DualListBox, { CommonProperties, Option } from 'react-dual-listbox';
import 'react-dual-listbox/lib/react-dual-listbox.css';

export type DualListProps<P> = {
  canFilter?: boolean;
  filterPlaceholder?: string;
  selected: P[];
  available?: P[];
  onChange: (selected: P[]) => void;
  options: CommonProperties<P>['options'];
  alignActions?: 'top' | 'middle';
  disabled?: boolean;
  preserveSelectOrder?: boolean;
  showOrderButtons?: boolean;
  allowDuplicates?: boolean;
};

export function DualList<P>({
  canFilter,
  filterPlaceholder,
  ...props
}: DualListProps<P>) {
  const filterFunc = canFilter
    ? {
        filterCallback: (Optgroup: Option<P>, filterInput: string) => {
          if (filterInput === '') {
            return true;
          }

          return new RegExp(filterInput, 'i').test(Optgroup.label);
        },
        filterPlaceholder,
      }
    : {};

  return (
    <DualListBox
      icons={{
        moveLeft: <span className="mdi mdi-chevron-left" key="key" />,
        moveAllLeft: [
          <span className="mdi mdi-chevron-double-left" key="key" />,
        ],
        moveRight: <span className="mdi mdi-chevron-right" key="key" />,
        moveAllRight: [
          <span className="mdi mdi-chevron-double-right" key="key" />,
        ],
        moveDown: <span className="mdi mdi-chevron-down" key="key" />,
        moveUp: <span className="mdi mdi-chevron-up" key="key" />,
        moveTop: <span className="mdi mdi-chevron-double-up" key="key" />,
        moveBottom: <span className="mdi mdi-chevron-double-down" key="key" />,
      }}
      canFilter={canFilter}
      {...filterFunc}
      {...props}
    />
  );
}
