/* eslint-disable @typescript-eslint/no-explicit-any */
import BreadCrumb from '@growth/growforce-admin-ui/components/Common/BreadCrumb';
import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import TableContainer from '@growth/growforce-admin-ui/components/Common/TableContainer';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { Button } from 'reactstrap';
import { NextPageWithLayout } from '../../@types/next';
import Layout from '../../containers/Layout';

import Loader from '@growth/growforce-admin-ui/components/Common/Loader';
import { Col, Row } from '@growth/growforce-admin-ui/index';
import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import Head from 'next/head';
import { IPriceList } from '../../@types/priceList';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { getPriceLists } from '../../components/PriceLists/getPriceLists';
import { api } from '../../services/apiClient';
import { withSSRAuth } from '../../utils/withSSRAuth';

/**
 * PriceListsProps is an object with three properties: priceLists, total, and totalPages. priceLists
 * is an array of IPriceList objects, total is a number, and totalPages is a number.
 * @property {IPriceList[]} priceLists - An array of IPriceList objects.
 * @property {number} total - The total number of priceLists in the database.
 * @property {number} totalPages - The total number of pages.
 */
type PriceListsProps = {
  priceLists: IPriceList[];
  totalPages: number;
};

/**
 * CellProps is an object with a row property that is an object with an original
 * property that is an IPriceList.
 * @property row - The row object that contains the data for the current row.
 */
type CellProps = {
  row: {
    original: IPriceList;
  };
};

const PriceLists: NextPageWithLayout<PriceListsProps> = ({
  priceLists: initialPriceLists,
  totalPages: initialTotalPages,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sortedBy, setSortedBy] = useState('');
  const {
    data: { priceLists, totalPages },
    refetch: handleRefetchPriceLists,
  } = useQuery(
    ['priceLists', currentPage, sortedBy, currentPageSize],
    async () => {
      const response = await getPriceLists(undefined, {
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
                name: {
                  $containsi: search,
                },
              },
              {
                cnpj: {
                  $containsi: search,
                },
              },
              {
                email: {
                  $containsi: search,
                },
              },
            ],
          }),
        },
      });

      return {
        priceLists: response.priceLists,
        totalPages: response.totalPages,
      };
    },
    {
      initialData: {
        priceLists: initialPriceLists,
        totalPages: initialTotalPages,
      },
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    },
  );

  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * It takes a search string, and then calls the getPriceLists function from the API,
   * passing in the search string as a filter
   * @param {string} search - string - The search string
   */
  const handleSearch = useCallback(
    async (search: string) => {
      setSearch(search);
      setCurrentPage(1);

      await handleRefetchPriceLists();
    },
    [handleRefetchPriceLists],
  );

  /**
   * It gets the priceLists from the API, sets the priceLists, total, totalPages, and
   * currentPage state variables, and then calls the handleChangePage function
   * @param {number} page - The page number to fetch
   */
  const handleChangePage = useCallback(async (page: number) => {
    setCurrentPage(page);
  }, []);

  /**
   * It's a function that deletes a company from the database, and then refreshes the
   * page
   * @param {number} id - number - The id of the company to be deleted
   */
  const handleDeleteCompany = useCallback(
    async (id: number) => {
      try {
        await api.delete(`/price-lists/${id}`);

        await handleRefetchPriceLists();
      } catch (error) {
        //toast.error('Erro ao excluir pedido');
      }
    },
    [handleRefetchPriceLists],
  );

  /* It's a function that takes a sortBy string and an order string, and then
  sets the currentPage state variable to 1, sets the sortedBy state variable to
  the sortBy string and the order string, and then calls the handleRefetchPriceLists
  function. */
  const handleSortBy = useCallback(
    async (sortBy: string, order: 'desc' | 'asc') => {
      setCurrentPage(1);
      setSortedBy(`${sortBy}:${order}`);
    },
    [],
  );

  const handleDeletePriceLists = useCallback(async () => {
    setIsDeleting(true);
    try {
      for (const id of deleteIds) {
        await api.delete(`/price-lists/${id}`);
      }

      await handleRefetchPriceLists();
      setDeleteIds([]);
    } catch (error) {
      //toast.error('Erro ao excluir pedido');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteIds, handleRefetchPriceLists]);

  const checkedAll = useCallback(() => {
    setDeleteIds((oldValues) => {
      if (oldValues.length === priceLists.length) {
        return [];
      } else {
        return priceLists.map((coupon) => coupon.id);
      }
    });
  }, [priceLists]);

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
              deleteIds.length === priceLists.length && deleteIds.length > 0
            }
          />
        ),
        Cell: (cellProps: CellProps) => {
          return (
            <input
              type="checkbox"
              className="customerCheckBox form-check-input"
              value={cellProps.row.original.id}
              checked={deleteIds.includes(cellProps.row.original.id)}
              onChange={(e) => {
                setDeleteIds((oldValues) => {
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
        Header: 'ID',
        accessor: 'id',
        filterable: false,
        Cell: (cellProps: CellProps) => (
          <span>{cellProps.row.original.id}</span>
        ),
      },
      {
        Header: 'Nome da lista',
        accessor: 'name',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          return <span className="d-block">{cellProps.row.original.name}</span>;
        },
      },
      {
        Header: 'Ações',
        canSort: false,
        Cell: (cellProps: CellProps) => {
          return (
            <div className="d-flex gap-3">
              <div className="edit d-flex align-items-center">
                <Link
                  href={`/price-lists/edit/${cellProps.row.original.id}`}
                  className="cursor-pointer"
                  aria-label="Editar company"
                >
                  <i className="ri-pencil-fill"></i>
                </Link>
              </div>
              <div className="delete">
                <ConfirmationModal
                  changeStatus={() =>
                    handleDeleteCompany(cellProps.row.original.id)
                  }
                  title="Excluir company"
                  message="Tem certeza que deseja excluir essa company? Essa ação não pode ser desfeita."
                >
                  <button
                    className="btn btn-link shadow-none p-0 text-danger fs-5 text-decoration-none cursor-pointer"
                    aria-label="Deletar company"
                  >
                    <i className="ri-delete-bin-line" color="success"></i>
                  </button>
                </ConfirmationModal>
              </div>
            </div>
          );
        },
      },
    ],
    [checkedAll, deleteIds, handleDeleteCompany, priceLists.length],
  );

  const orderBy = useMemo(() => {
    const [id, desc] = sortedBy.split(':');

    return [
      {
        id,
        desc: desc === 'desc',
      },
    ];
  }, [sortedBy]);

  /* It's a function that takes a search string, and then calls the getPriceLists
  function from the API, passing in the search string as a filter */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce(handleSearch, 500), []);

  return (
    <div className="page-content">
      <Head>
        <title>Lista de Preços - Dashboard</title>
      </Head>

      <BreadCrumb title="Lista de Preços" pageTitle="Ecommerce" />

      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header className="card-header">
              <div className="d-flex align-items-center">
                <h5 className="card-title mb-0 flex-grow-1">Lista de Preços</h5>
                <div className="flex-shrink-0">
                  <Link
                    href={'/price-lists/create'}
                    className="btn shadow-none btn-success"
                  >
                    <i className="ri-add-line align-bottom me-1"></i>
                    Adicionar nova lista de prelço
                  </Link>{' '}
                  {deleteIds.length > 0 && (
                    <ConfirmationModal
                      changeStatus={handleDeletePriceLists}
                      title="Excluir priceLists"
                      message="Tem certeza que deseja excluir essas priceLists? Essa ação não pode ser desfeita."
                    >
                      <button
                        type="button"
                        className="btn shadow-none btn-soft-danger bg"
                      >
                        <i className="ri-delete-bin-line align-bottom"></i>
                      </button>
                    </ConfirmationModal>
                  )}
                </div>
              </div>
            </Card.Header>

            <Card.Body>
              <div id="customerList">
                <Row className="mb-4">
                  <Col>
                    <div>
                      <div className="search-box ms-2">
                        <input
                          type="text"
                          className="form-control search"
                          placeholder="Pesquise..."
                          value={search}
                          onChange={(e) => {
                            setSearch(e.target.value);
                            debouncedSearch(e.target.value);
                          }}
                        />
                        <i className="ri-search-line search-icon"></i>
                      </div>
                    </div>
                  </Col>

                  <Col
                    style={{
                      maxWidth: 'calc(calc(var(--vz-gutter-x) * 0.5) + 102px)',
                    }}
                  >
                    <Button
                      color="info"
                      className="shadow-none"
                      style={{
                        width: '100%',
                        opacity: 1,
                      }}
                      disabled
                    >
                      <i className=" ri-equalizer-fill align-bottom me-2"></i>
                      Filtros
                    </Button>
                  </Col>
                </Row>
              </div>

              <div>
                <TableContainer
                  columns={columns}
                  data={priceLists}
                  customPageSize={10}
                  divClass="table-responsive mb-1"
                  tableClass="mb-0 align-middle table-borderless"
                  theadClass="table-light text-muted"
                  currentPage={currentPage}
                  onChangePage={handleChangePage}
                  totalPages={totalPages}
                  onSortBy={handleSortBy}
                  sortedBy={orderBy}
                  setCurrentPageSize={setCurrentPageSize}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {isDeleting && <Loader loading={null} />}
    </div>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  try {
    const props = await getPriceLists(ctx, {
      populate: '*',
      publicationState: 'preview',
      pagination: {
        pageSize: 10,
      },
    });

    return {
      props,
    };
  } catch (error) {
    return {
      props: {
        priceLists: [],
        totalPages: 0,
      },
    };
  }
});

export default PriceLists;

PriceLists.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
