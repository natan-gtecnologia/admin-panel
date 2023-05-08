/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/link-passhref */
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';

import { formatNumberToReal } from '@growth/core/util/formatting';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import TableContainer from '@growth/growforce-admin-ui/components/Common/TableContainer';
import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { NextPageContext } from 'next';
import Link from 'next/link';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Col, Row } from 'reactstrap';
import { ICoupon } from '../../@types/coupon';
import { api } from '../../services/apiClient';
import { ConfirmationModal } from '../ConfirmationModal';

/**
 * `ListCouponsProps` is an object with two properties: `initialCoupons` and
 * `initialTotalPages`, both of which are arrays of `ICoupon` objects, and a method
 * called `getCoupons` that takes a `NextPageContext` object and a `Record<string,
 * any>` object and returns a promise that resolves to an object with two
 * properties: `coupons` and `totalPages`, both of which are arrays of `ICoupon`
 * objects.
 * @property {ICoupon[]} initialCoupons - This is the initial coupons that will be
 * displayed on the page.
 * @property {number} initialTotalPages - The total number of pages of coupons that
 * exist.
 */
type ListCouponsProps = {
  initialCoupons: ICoupon[];
  initialTotalPages: number;
  getCoupons(
    ctx: Pick<NextPageContext, 'req'>,
    params: Record<string, any>,
  ): Promise<{
    coupons: ICoupon[];
    totalPages: number;
  }>;
  setSelectedIds: Dispatch<SetStateAction<number[]>>;
  selectedIds: number[];
};

/**
 * CellProps is an object with a row property that is an object with an original
 * property that is an ICoupon.
 * @property row - This is the entire row of data.
 */
type CellProps = {
  row: {
    original: ICoupon;
  };
};

export function ListCoupons({
  initialCoupons,
  getCoupons,
  initialTotalPages,
  setSelectedIds,
  selectedIds,
}: ListCouponsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [sortedBy, setSortedBy] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const {
    data: { coupons, totalPages },
    refetch: handleRefetchCoupons,
  } = useQuery(
    ['coupons', currentPage, sortedBy, type, currentPageSize],
    async () => {
      const response = await getCoupons(undefined, {
        pagination: {
          pageSize: currentPageSize,
          page: currentPage,
        },
        ...(sortedBy && {
          sort: sortedBy,
        }),
        filters: {
          ...(search && {
            $or: [
              {
                description: {
                  $containsi: search,
                },
              },
              {
                code: {
                  $containsi: search,
                },
              },
            ],
          }),
          ...(type && {
            type: {
              $eq: type,
            },
          }),
        },
      });

      return {
        coupons: response.coupons,
        totalPages: response.totalPages,
      };
    },
    {
      initialData: {
        coupons: initialCoupons,
        totalPages: initialTotalPages,
      },
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    },
  );

  /* A callback function that is called when the page is changed. */
  const handleChangePage = useCallback(async (page: number) => {
    setCurrentPage(page);
  }, []);

  /* A callback function that is called when the user clicks on a column header to
  sort the table by that column. */
  const handleSortBy = useCallback(
    async (sortBy: string, order: 'desc' | 'asc') => {
      setCurrentPage(1);
      setSortedBy(`${sortBy}:${order}`);
    },
    [],
  );

  const handleDeleteCoupon = useCallback(
    async (id: number) => {
      try {
        await api.delete(`/coupons/${id}`);

        await handleRefetchCoupons();
      } catch (error) {
        console.error(error);
      }
    },
    [handleRefetchCoupons],
  );

  const checkedAll = useCallback(() => {
    setSelectedIds((oldValues) => {
      if (oldValues.length === coupons.length) {
        return [];
      } else {
        return coupons.map((coupon) => coupon.id);
      }
    });
  }, [coupons, setSelectedIds]);

  const handleSearch = useCallback(
    async (search: string) => {
      try {
        setCurrentPage(1);

        await handleRefetchCoupons();
      } catch (e) {
        console.log(e);
      }
    },
    [handleRefetchCoupons],
  );

  /* Disabling the eslint rule that says that you should not have a
  dependency in a useCallback hook that is not in the dependency array. */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce(handleSearch, 500), []);

  const columns = useMemo(
    () => [
      {
        Header: (
          <input
            type="checkbox"
            id="checkBoxAll"
            className="form-check-input"
            onChange={checkedAll}
            checked={
              selectedIds.length === coupons.length && selectedIds.length > 0
            }
          />
        ),
        Cell: (cellProps: CellProps) => {
          return (
            <input
              type="checkbox"
              className="customerCheckBox form-check-input"
              value={cellProps.row.original.id}
              checked={selectedIds.includes(cellProps.row.original.id)}
              onChange={(e) => {
                setSelectedIds((oldValues) => {
                  if (oldValues.includes(cellProps.row.original.id)) {
                    return oldValues.filter(
                      (value) => value !== cellProps.row.original.id,
                    );
                  }

                  return [...oldValues, cellProps.row.original.id];
                });
              }}
            />
          );
        },
        id: '#',
      },
      {
        Header: 'ID ',
        accessor: 'id',
      },
      {
        Header: 'Descrição',
        accessor: 'description',
        filterable: false,
      },
      {
        Header: 'Desconto',
        accessor: 'discount',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          return (
            <>
              {![
                'buy_and_earn_by_products',
                'buy_and_earn_by_categories',
                'buy_and_earn_by_cart_price',
              ].includes(cellProps.row.original.type) &&
                cellProps.row.original.shippingType !== 'free_shipping' &&
                cellProps.row.original.discountType === 'percentage' && (
                  <span>{cellProps.row.original.discount}%</span>
                )}

              {![
                'buy_and_earn_by_products',
                'buy_and_earn_by_categories',
                'buy_and_earn_by_cart_price',
              ].includes(cellProps.row.original.type) &&
                cellProps.row.original.shippingType !== 'free_shipping' &&
                cellProps.row.original.discountType === 'price' && (
                  <span>
                    {formatNumberToReal(cellProps.row.original.discount * -1)}
                  </span>
                )}

              {cellProps.row.original.shippingType === 'free_shipping' && (
                <span>Frete Grátis</span>
              )}

              {[
                'buy_and_earn_by_products',
                'buy_and_earn_by_categories',
                'buy_and_earn_by_cart_price',
              ].includes(cellProps.row.original.type) && (
                  <span>Compre e ganhe</span>
                )}
            </>
          );
        },
      },
      {
        Header: 'Ativado',
        accessor: 'active',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          return (
            <>
              {cellProps.row.original.enabled ? (
                <span className="badge bg-success">Sim</span>
              ) : (
                <span className="badge bg-danger">Não</span>
              )}
            </>
          );
        },
      },
      {
        Header: 'Código',
        accessor: 'code',
      },
      {
        Header: 'Ações',
        Cell: (cellProps: CellProps) => {
          return (
            <ul className="list-inline hstack gap-2 mb-0">
              <li className="list-inline-item edit" title="Edit">
                <Link
                  href={`/coupons/edit/${cellProps.row.original.id}`}
                  className="text-muted d-inline-block edit-item-btn"
                  aria-label="Editar cupom de desconto"
                >
                  <i className="ri-pencil-fill fs-16"></i>
                </Link>
              </li>
              <li className="list-inline-item" title="Copy">
                <Button
                  href={`/coupons/clone/${cellProps.row.original.id}`}
                  className="p-0 bg-transparent shadow-none border-0 text-muted d-inline-block remove-item-btn"
                  aria-label='Copiar "Cupom de desconto de 10% para todos os produtos"'
                >
                  <i className="bx bxs-copy fs-16"></i>
                </Button>
              </li>
              <li className="list-inline-item" title="Remove">
                <ConfirmationModal
                  changeStatus={() =>
                    handleDeleteCoupon(cellProps.row.original.id)
                  }
                  title="Remover cupom de desconto"
                  message="Tem certeza que deseja remover este cupom de desconto? Esta ação não pode ser desfeita."
                >
                  <Button
                    className="p-0 bg-transparent shadow-none text-danger border-0 d-inline-block remove-item-btn"
                    aria-label="Remover cupom de desconto"
                  >
                    <i className="ri-delete-bin-line fs-16"></i>
                  </Button>
                </ConfirmationModal>
              </li>
            </ul>
          );
        },
      },
    ],
    [
      checkedAll,
      coupons.length,
      handleDeleteCoupon,
      selectedIds,
      setSelectedIds,
    ],
  );

  /* Splitting the `sortedBy` string into two parts, the first part is the
  column name and the second part is the order. It then returns an array with an
  object that has the column name and the order. */
  const orderBy = useMemo(() => {
    const [id, desc] = sortedBy.split(':');

    return [
      {
        id,
        desc: desc === 'desc',
      },
    ];
  }, [sortedBy]);

  return (
    <>
      <Row className="mb-3">
        <Col>
          <div className="input-group shadow-none border border-light border-3 bg-transparent">
            <span
              className="input-group-text bg-transparent border-0 ps-2 pe-1"
              id="basic-addon1"
            >
              <i className="mdi mdi-magnify"></i>
            </span>
            <Input
              type="text"
              className="form-control ps-2 border-0"
              placeholder="Pesquise pelo cupom desejado..."
              aria-label="Pesquise pelo cupom desejado..."
              aria-describedby="basic-addon1"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                debouncedSearch(e.target.value);
              }}
            />
          </div>
        </Col>
        <Col lg={3}>
          <select
            className="form-select"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
            }}
          >
            <option value="">Todos</option>
            <option value="specific_products">
              Cupom de desconto para produtos específicos
            </option>
            <option value="specific_categories">
              Cupom de desconto para categorias específicas
            </option>
            <option value="specific_customers">
              Cupom de desconto para clientes específicos
            </option>
            <option value="free_shipping_by_region">
              Frete grátis por região
            </option>
            <option value="free_shipping_by_products">
              Frete grátis por produtos
            </option>
            <option value="free_shipping_by_categories">
              Frete grátis por categorias
            </option>
            <option value="buy_and_earn_by_products">
              Compre e ganhe por produtos
            </option>
            <option value="buy_and_earn_by_categories">
              Compre e ganhe por categorias
            </option>
            <option value="buy_and_earn_by_cart_price">
              Compre e ganhe por valor do carrinho
            </option>
          </select>
        </Col>
        <Col
          style={{
            maxWidth: 'calc(calc(var(--vz-gutter-x) * 0.5) + 102px)',
          }}
        >
          <Button
            color="info"
            style={{
              width: '100%',
              opacity: 1,
            }}
            disabled
          >
            <i className="ri-equalizer-fill me-2 align-bottom" />
            Filtros
          </Button>
        </Col>
      </Row>

      <TableContainer
        columns={columns}
        data={coupons || []}
        customPageSize={10}
        theadClass="table-light text-muted"
        currentPage={currentPage}
        totalPages={totalPages}
        onChangePage={handleChangePage}
        onSortBy={handleSortBy}
        sortedBy={orderBy}
        setCurrentPageSize={setCurrentPageSize}
      />
    </>
  );
}
