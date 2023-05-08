/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import BreadCrumb from '@growth/growforce-admin-ui/components/Common/BreadCrumb';
import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import TableContainer from '@growth/growforce-admin-ui/components/Common/TableContainer';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { NextPageWithLayout } from '../../@types/next';
import Layout from '../../containers/Layout';

import Loader from '@growth/growforce-admin-ui/components/Common/Loader';
import { Tabs } from '@growth/growforce-admin-ui/components/Common/Tabs';
import { Col, Row } from '@growth/growforce-admin-ui/index';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import debounce from 'lodash/debounce';
import { NextPageContext } from 'next';
import Head from 'next/head';
import QueryString from 'qs';
import { IBanner } from '../../@types/banner';
import { IStrapiBanner } from '../../@types/strapi';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { setupAPIClient } from '../../services/api';
import { api } from '../../services/apiClient';
import { convert_banner_strapi } from '../../utils/convertions/convert_banner';
import { withSSRAuth } from '../../utils/withSSRAuth';

/**
 * TagsProps is an object with three properties: tags, total, and totalPages. tags
 * is an array of ITag objects, total is a number, and totalPages is a number.
 * @property {IBanner[]} banners - An array of ITag objects.
 * @property {number} total - The total number of tags in the database.
 * @property {number} totalPages - The total number of pages.
 */
type BannersProps = {
  banners: IBanner[];
  totalPages: number;
};

/**
 * CellProps is an object with a row property that is an object with an original
 * property that is an ITag.
 * @property row - The row object that contains the data for the current row.
 */
type CellProps = {
  row: {
    original: IBanner;
  };
};

/**
 * It fetches a list of tags from the Strapi API, and converts them to a format
 * that's easier to work with in the frontend
 * @param params - Record<string, any> - The parameters to be passed to the API
 */
async function getBanners(
  ctx: Pick<NextPageContext, 'req'>,
  params: Record<string, any>,
) {
  const apiClient = setupAPIClient(ctx);

  const banners = await apiClient.get<{
    meta: {
      pagination: {
        total: number;
        pageCount: number;
      };
    };
    data: IStrapiBanner[];
  }>('banners', {
    params: {
      populate: '*',
      pagination: {
        pageSize: 10,
        ...params.pagination,
      },
      publicationState: 'preview',
      ...params,
    },
    paramsSerializer: (params) => {
      return QueryString.stringify(params);
    },
  });

  return {
    banners: banners.data.data.map(convert_banner_strapi),
    totalPages: banners.data.meta.pagination.pageCount,
  };
}

const Banners: NextPageWithLayout<BannersProps> = ({
  banners: initialBanners,
  totalPages: initialTotalPages,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sortedBy, setSortedBy] = useState('');
  const [publicationState, setPublicationState] = useState('preview');

  const {
    data: { banners, totalPages },
    refetch: handleRefetchBanners,
  } = useQuery(
    ['banners', currentPage, sortedBy, publicationState, currentPageSize],
    async () => {
      const state = publicationState === 'draft' ? 'preview' : publicationState;

      const response = await getBanners(undefined, {
        publicationState: state,
        pagination: {
          pageSize: currentPageSize,
          page: currentPage,
        },
        ...(sortedBy && {
          sort: sortedBy,
        }),
        filters: {
          ...(publicationState === 'draft' && {
            publishedAt: {
              $null: true,
            },
          }),
          ...(search && {
            $or: [
              {
                titulo: {
                  $containsi: search,
                },
              },
              {
                color: {
                  $containsi: search,
                },
              },
            ],
          }),
        },
      });

      return {
        banners: response.banners,
        totalPages: response.totalPages,
      };
    },

    {
      initialData: {
        banners: initialBanners,
        totalPages: initialTotalPages,
      },
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    },
  );

  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * It takes a search string, and then calls the getTags function from the API,
   * passing in the search string as a filter
   * @param {string} search - string - The search string
   */
  const handleSearch = useCallback(
    async (search: string) => {
      setSearch(search);
      setCurrentPage(1);

      await handleRefetchBanners();
    },
    [handleRefetchBanners],
  );

  /**
   * It gets the tags from the API, sets the tags, total, totalPages, and
   * currentPage state variables, and then calls the handleChangePage function
   * @param {number} page - The page number to fetch
   */
  const handleChangePage = useCallback(async (page: number) => {
    setCurrentPage(page);
  }, []);

  /**
   * It's a function that deletes a tag from the database, and then refreshes the
   * page
   * @param {number} id - number - The id of the tag to be deleted
   */
  const handleDeleteBanner = useCallback(
    async (id: number) => {
      try {
        await api.delete(`/banneres/${id}`);

        await handleRefetchBanners();
      } catch (error) {
        //toast.error('Erro ao excluir pedido');
      }
    },
    [handleRefetchBanners],
  );

  /* It's a function that takes a sortBy string and an order string, and then
  sets the currentPage state variable to 1, sets the sortedBy state variable to
  the sortBy string and the order string, and then calls the handleRefetchTags
  function. */
  const handleSortBy = useCallback(
    async (sortBy: string, order: 'desc' | 'asc') => {
      setCurrentPage(1);
      setSortedBy(`${sortBy}:${order}`);
    },
    [],
  );

  const handleDeleteBanners = useCallback(async () => {
    setIsDeleting(true);
    try {
      for (const id of deleteIds) {
        await api.delete(`/banners/${id}`);
      }

      await handleRefetchBanners();
      setDeleteIds([]);
    } catch (error) {
      //toast.error('Erro ao excluir pedido');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteIds, handleRefetchBanners]);

  const handleGetByStatus = useCallback(async (status: string) => {
    setPublicationState(status);
    setCurrentPage(1);
    setSortedBy('');
  }, []);

  const checkedAll = useCallback(() => {
    setDeleteIds((oldValues) => {
      if (oldValues.length === banners.length) {
        return [];
      } else {
        return banners.map((coupon) => coupon.id);
      }
    });
  }, [banners]);

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
              deleteIds.length === banners.length && deleteIds.length > 0
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
        Header: 'Banner',
        filterable: false,
        Cell: (cellProps: CellProps) => (
          <>
            <div className="flex-shrink-0 me-3">
              <div className="avatar-sm bg-light rounded p-1">
                {cellProps.row.original.desktop_image && (
                  <img
                    src={
                      cellProps.row.original.desktop_image?.data?.attributes
                        .formats.thumbnail.url
                    }
                    alt=""
                    className="img-fluid d-block object-cover"
                  />
                )}
              </div>
            </div>
          </>
        ),
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
        Header: 'Título',
        accessor: 'titulo',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          return (
            <span className="d-block">{cellProps.row.original.title}</span>
          );
        },
      },
      {
        Header: 'Página do banner',
        accessor: 'page',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          return <span className="d-block">{cellProps.row.original.page}</span>;
        },
      },
      {
        Header: 'Local de exibição',
        accessor: 'exhibition',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          return <span className="d-block">{cellProps.row.original.type}</span>;
        },
      },
      {
        Header: 'Status',
        accessor: 'publishedAt',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          return (
            <span
              className={clsx('badge align-middle rounded text-uppercase', {
                'badge-soft-success': cellProps.row.original.publishedAt,
                'badge-soft-danger': !cellProps.row.original.publishedAt,
              })}
            >
              {cellProps.row.original.publishedAt ? 'Publicado' : 'Rascunho'}
            </span>
          );
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
                  href={`/banners/edit/${cellProps.row.original.id}`}
                  className="cursor-pointer"
                  aria-label="Editar Banner"
                >
                  <i className="ri-pencil-fill"></i>
                </Link>
              </div>
              <div className="delete">
                <ConfirmationModal
                  changeStatus={() =>
                    handleDeleteBanner(cellProps.row.original.id)
                  }
                  title="Excluir banner"
                  message="Tem certeza que deseja excluir esse banner? Essa ação não pode ser desfeita."
                >
                  <button
                    className="btn btn-link shadow-none p-0 text-danger fs-5 text-decoration-none cursor-pointer"
                    aria-label="Deletar tag"
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
    [banners.length, checkedAll, deleteIds, handleDeleteBanner],
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

  /* It's a function that takes a search string, and then calls the getTags
  function from the API, passing in the search string as a filter */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce(handleSearch, 500), []);

  return (
    <div className="page-content">
      <Head>
        <title>Banners - GrowForce</title>
      </Head>

      <BreadCrumb title="Banners" pageTitle="Ecommerce" />

      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header className="card-header">
              <div className="d-flex align-items-center">
                <h5 className="card-title mb-0 flex-grow-1">Banners</h5>
                <div className="d-flex">
                  <Link
                    href={'/banners/create'}
                    className="btn shadow-none btn-success"
                  >
                    <i className="ri-add-line align-bottom me-1"></i>
                    Adicionar novo banner
                  </Link>{' '}
                  {/* <button type="button" className="btn shadow-none btn-info">
                    <i className="ri-file-download-line align-bottom me-1"></i>{' '}
                    Importar
                  </button>{' '} */}
                  <div className="search-box ms-2 flex-grow-1">
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
                  {deleteIds.length > 0 && (
                    <ConfirmationModal
                      changeStatus={handleDeleteBanners}
                      title="Excluir banners"
                      message="Tem certeza que deseja excluir essas tags? Essa ação não pode ser desfeita."
                    >
                      <button
                        type="button"
                        className="btn shadow-none btn-soft-danger bg ms-2"
                      >
                        <i className="ri-delete-bin-line align-bottom"></i>
                      </button>
                    </ConfirmationModal>
                  )}
                </div>
              </div>
            </Card.Header>

            <Card.Body>
              <div>
                <div
                  style={{
                    height: 40,
                    marginBottom: 6,
                  }}
                >
                  <Tabs
                    dataTabs={[
                      {
                        title: (
                          <>
                            Todos{' '}
                            {/*<span className="badge badge-soft-danger align-middle rounded-pill ms-1">
                              12
                            </span>*/}
                          </>
                        ),
                        content: <span />,
                        id: 'preview',
                      },
                      {
                        title: <>Publicados </>,
                        content: <span />,
                        id: 'live',
                      },
                      {
                        title: <>Rascunhos </>,
                        content: <span />,
                        id: 'draft',
                      },
                    ]}
                    tabs
                    className="nav-tabs-custom card-header-tabs border-bottom-0 nav"
                    onTabChange={handleGetByStatus}
                  />
                </div>
                <TableContainer
                  columns={columns}
                  data={banners || []}
                  customPageSize={10}
                  divClass="table-responsive mb-1"
                  tableClass="mb-0 align-middle table-borderless"
                  theadClass="table-light text-muted"
                  onSortBy={handleSortBy}
                  sortedBy={orderBy}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onChangePage={handleChangePage}
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
  const props = await getBanners(ctx, {
    populate: '*',
    publicationState: 'preview',
    pagination: {
      pageSize: 10,
    },
  });

  return {
    props,
  };
});

export default Banners;

Banners.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
