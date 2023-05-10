import { ChangeEvent, Fragment } from "react";
import {
  useExpanded,
  useFilters,
  useGlobalFilter,
  useRowSelect,
  useSortBy,
  useTable,
} from "react-table";
import { Button, Col, Input, Row, Table } from "reactstrap";
import { DefaultColumnFilter } from "./filters";

export type TableContainerProps = {
  columns: any;
  data: any;
  customPageSize: number;
  tableClass?: string;
  theadClass?: string;
  trClass?: string;
  thClass?: string;
  divClass?: string;

  currentPage?: number;
  totalPages?: number;
  onChangePage?: (page: number) => void;
  onSortBy?: (sortBy: string, order: "desc" | "asc") => void;
  setCurrentPageSize?: (pageSize: number) => void;
  hidePagination?: boolean;
  sortedBy?: any;
};

const TableContainer = ({
  columns,
  data,
  customPageSize,
  tableClass,
  theadClass,
  trClass,
  thClass,
  divClass,

  currentPage = 1,
  totalPages = 1,
  onChangePage = console.log,
  setCurrentPageSize = console.log,
  hidePagination = false,

  onSortBy,
  sortedBy = [],
}: TableContainerProps) => {
  // @ts-ignore
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  }: any = useTable<any>(
    {
      columns,
      data,
      // @ts-ignore
      defaultColumn: { Filter: DefaultColumnFilter },
      initialState: {
        // @ts-ignore
        pageIndex: 0,
        pageSize: customPageSize,
        selectedRowIds: 0,
        sortBy: sortedBy,
      },
      disableMultiSort: true,
      orderByFn: (rows: any) => {
        return rows;
      },
      sortBy: sortedBy,
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    useExpanded,
    useRowSelect
  );
  const canPreviousPage = currentPage > 1;
  const canNextPage = currentPage < totalPages;

  const onChangeInInput = (event: ChangeEvent<HTMLInputElement>) => {
    const page = event.target.value ? Number(event.target.value) : 0;
    onChangePage(page > totalPages ? totalPages : page);
  };

  const handleChangeSortBy = (column: any) => {
    if (column.canSort) {
      if (onSortBy) onSortBy(column.id, !column.isSortedDesc ? "desc" : "asc");
    }
  };

  return (
    <Fragment>
      <div className={divClass}>
        <Table hover {...getTableProps()} className={tableClass}>
          <thead className={theadClass}>
            {headerGroups.map((headerGroup: any) => (
              <tr
                className={trClass}
                key={headerGroup.id}
                {...headerGroup.getHeaderGroupProps()}
              >
                {headerGroup.headers.map((column: any) => (
                  <th
                    key={column.id}
                    className={thClass}
                    {...column.getHeaderProps(
                      column.getSortByToggleProps({
                        onClick: () => handleChangeSortBy(column),

                        style: {
                          minWidth: column.minWidth,
                          width: column.width,
                        },
                      })
                    )}
                  >
                    <span className="d-flex align-items-center">
                      {column.render("Header")}
                      {/* <Filter column={column} /> */}
                      {sortedBy.length > 0 && (
                        <span className="ms-1 d-block">
                          {sortedBy[0].id === column.id ? (
                            sortedBy[0].desc ? (
                              <i className="ri-sort-desc" />
                            ) : (
                              <i className="ri-sort-asc" />
                            )
                          ) : null}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody {...getTableBodyProps()}>
            {rows.map((row: any) => {
              prepareRow(row);
              return (
                <Fragment key={row.getRowProps().key}>
                  <tr>
                    {row.cells.map((cell: any) => {
                      return (
                        <td key={cell.id} {...cell.getCellProps()}>
                          {cell.render("Cell")}
                        </td>
                      );
                    })}
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </Table>
      </div>

      {!hidePagination && (
        <Row className="justify-content-md-end justify-content-center align-items-center p-2">
          <Col className="col-md-auto">
            <select
              className={"form-select"}
              aria-label="Tamanho da página"
              id="pageSize"
              onChange={(e) => {
                setCurrentPageSize(Number(e.target.value));
                onChangePage(1);
              }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </Col>

          <Col className="col-md-auto">
            <div className="d-flex gap-1">
              <Button
                color="primary"
                onClick={() => onChangePage(currentPage - 1)}
                disabled={!canPreviousPage}
              >
                {"<"}
              </Button>
            </div>
          </Col>
          <Col className="col-md-auto d-none d-md-block">
            Página{" "}
            <strong>
              {currentPage} de {totalPages}
            </strong>
          </Col>
          <Col className="col-md-auto">
            <Input
              type="number"
              min={1}
              step={1}
              max={totalPages}
              style={{ width: 70 }}
              value={currentPage}
              onChange={onChangeInInput}
            />
          </Col>

          <Col className="col-md-auto">
            <div className="d-flex gap-1">
              <Button
                color="primary"
                onClick={() => onChangePage(currentPage + 1)}
                disabled={!canNextPage}
              >
                {">"}
              </Button>
            </div>
          </Col>
        </Row>
      )}
    </Fragment>
  );
};

export default TableContainer;
