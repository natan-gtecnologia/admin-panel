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
import { NextPageContext } from 'next';
import Head from 'next/head';
import QueryString from 'qs';
import { IStrapiTag } from '../../@types/strapi';
import { ITag } from '../../@types/tag';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { setupAPIClient } from '../../services/api';
import { api } from '../../services/apiClient';
import { convert_tag_strapi } from '../../utils/convertions/convert_tag';
import { withSSRAuth } from '../../utils/withSSRAuth';

/**
 * TagsProps is an object with three properties: tags, total, and totalPages. tags
 * is an array of ITag objects, total is a number, and totalPages is a number.
 * @property {ITag[]} tags - An array of ITag objects.
 * @property {number} total - The total number of tags in the database.
 * @property {number} totalPages - The total number of pages.
 */
type TagsProps = {
  tags: ITag[];
  totalPages: number;
};

/**
 * CellProps is an object with a row property that is an object with an original
 * property that is an ITag.
 * @property row - The row object that contains the data for the current row.
 */
type CellProps = {
  row: {
    original: ITag;
  };
};

/**
 * It fetches a list of tags from the Strapi API, and converts them to a format
 * that's easier to work with in the frontend
 * @param params - Record<string, any> - The parameters to be passed to the API
 */
async function getTags(
  ctx: Pick<NextPageContext, 'req'>,
  params: Record<string, any>,
) {
  const apiClient = setupAPIClient(ctx);
  const tags = await apiClient.get<{
    meta: {
      pagination: {
        total: number;
        pageCount: number;
      };
    };
    data: IStrapiTag[];
  }>('/tags', {
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
    tags: tags.data.data.map(convert_tag_strapi),
    totalPages: tags.data.meta.pagination.pageCount,
  };
}

const Tags: NextPageWithLayout<TagsProps> = ({
  tags: initialTags,
  totalPages: initialTotalPages,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sortedBy, setSortedBy] = useState('');
  const {
    data: { tags, totalPages },
    refetch: handleRefetchTags,
  } = useQuery(
    ['tags', currentPage, sortedBy, currentPageSize],
    async () => {
      const response = await getTags(undefined, {
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
                tag: {
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
        tags: response.tags,
        totalPages: response.totalPages,
      };
    },
    {
      initialData: {
        tags: initialTags,
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

      await handleRefetchTags();
    },
    [handleRefetchTags],
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
  const handleDeleteTag = useCallback(
    async (id: number) => {
      try {
        await api.delete(`/tags/${id}`);

        await handleRefetchTags();
      } catch (error) {
        //toast.error('Erro ao excluir pedido');
      }
    },
    [handleRefetchTags],
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

  const handleDeleteTags = useCallback(async () => {
    setIsDeleting(true);
    try {
      for (const id of deleteIds) {
        await api.delete(`/tags/${id}`);
      }

      await handleRefetchTags();
      setDeleteIds([]);
    } catch (error) {
      //toast.error('Erro ao excluir pedido');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteIds, handleRefetchTags]);

  const checkedAll = useCallback(() => {
    setDeleteIds((oldValues) => {
      if (oldValues.length === tags.length) {
        return [];
      } else {
        return tags.map((coupon) => coupon.id);
      }
    });
  }, [tags]);

  const columns = useMemo(
    () => [
      {
        Header: (
          <input
            type="checkbox"
            id="checkBoxAll"
            className="form-check-input"
            onChange={checkedAll}
            checked={deleteIds.length === tags.length && deleteIds.length > 0}
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
        Header: 'TAG',
        accessor: 'tag',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          return <span className="d-block">{cellProps.row.original.tag}</span>;
        },
      },
      {
        Header: 'COR DA TAG',
        accessor: 'color',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          return (
            <>
              {cellProps.row.original.color !== 'transparent' ? (
                <span className="d-flex align-items-center gap-1">
                  <span
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '4px',
                      backgroundColor: cellProps.row.original.color,
                      display: 'inline-block',
                      border: '1px solid',
                    }}
                  />
                  {cellProps.row.original.color}
                </span>
              ) : (
                <span>Transparente</span>
              )}
            </>
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
                  href={`/tags/edit/${cellProps.row.original.id}`}
                  className="cursor-pointer"
                  aria-label="Editar tag"
                >
                  <i className="ri-pencil-fill"></i>
                </Link>
              </div>
              <div className="delete">
                <ConfirmationModal
                  changeStatus={() =>
                    handleDeleteTag(cellProps.row.original.id)
                  }
                  title="Excluir tag"
                  message="Tem certeza que deseja excluir essa tag? Essa ação não pode ser desfeita."
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
    [checkedAll, deleteIds, handleDeleteTag, tags.length],
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
        <title>Tags - Dashboard</title>
      </Head>

      <BreadCrumb title="Tags" pageTitle="Ecommerce" />

      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header className="card-header">
              <div className="d-flex align-items-center">
                <h5 className="card-title mb-0 flex-grow-1">Tags</h5>
                <div className="flex-shrink-0">
                  <Link
                    href={'/tags/create'}
                    className="btn shadow-none btn-success"
                  >
                    <i className="ri-add-line align-bottom me-1"></i>
                    Adicionar nova tag
                  </Link>{' '}
                  {deleteIds.length > 0 && (
                    <ConfirmationModal
                      changeStatus={handleDeleteTags}
                      title="Excluir tags"
                      message="Tem certeza que deseja excluir essas tags? Essa ação não pode ser desfeita."
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
                  data={tags}
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
  const props = await getTags(ctx, {
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

export default Tags;

Tags.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
