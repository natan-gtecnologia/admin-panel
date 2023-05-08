/* eslint-disable @typescript-eslint/no-explicit-any */
import clsx from 'clsx';
import addDays from 'date-fns/addDays';
import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';
import debounce from 'lodash/debounce';
import Link from 'next/link';
import QueryString from 'qs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import { Button } from 'reactstrap';
import { useRouter } from 'next/router';

import { formatNumberToReal } from '@growth/core/util/formatting';
import BreadCrumb from '@growth/growforce-admin-ui/components/Common/BreadCrumb';
import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import TableContainer from '@growth/growforce-admin-ui/components/Common/TableContainer';
import { Tabs } from '@growth/growforce-admin-ui/components/Common/Tabs';
import { useLayout } from '@growth/growforce-admin-ui/hooks/useLayout';
import { Col, Row } from '@growth/growforce-admin-ui/index';
import { useQuery } from '@tanstack/react-query';
import { NextPageContext } from 'next';
import Head from 'next/head';
import { NextPageWithLayout } from '../../@types/next';
import { IOrder } from '../../@types/order';
import { IStrapiOrder } from '../../@types/strapi';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import Layout from '../../containers/Layout';
import { setupAPIClient } from '../../services/api';
import { api } from '../../services/apiClient';
import { convert_order_strapi } from '../../utils/convertions/convert_order';
import { flatpickrPt } from '../../utils/flatpick-pt';
import { orderStatuses } from '../../utils/orderStatuses';
import { paymentMethods } from '../../utils/paymentMethods';
import { withSSRAuth } from '../../utils/withSSRAuth';
import { useSettings } from '../../contexts/SettingsContext';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
/**
 * OrdersProps is an object with three properties: orders, total, and totalPages.
 * @property {IOrder[]} orders - An array of orders.
 * @property {number} total - The total number of orders.
 * @property {number} totalPages - The total number of pages of orders.
 */
type OrdersProps = {
  orders: IOrder[];
  total: number;
  totalPages: number;
};

/**
 * CellProps is an object with a row property that is an object with an original
 * property that is an IOrder.
 * @property row - This is the entire row of data.
 */
type CellProps = {
  row: {
    original: IOrder;
  };
};

export const orderStatusTable = [
  { id: 1, value: 'PENDING', label: 'Pendente' },
  { id: 2, value: 'PAID', label: 'Pago' },
  { id: 3, value: 'SHIPPING', label: 'Em transporte' },
  { id: 4, value: 'SHIPPING_LAST_STEP', label: 'Última etapa de transporte' },
  { id: 5, value: 'COMPLETED', label: 'Concluído' },
  { id: 6, value: 'FAILED', label: 'Falhou' },
  { id: 7, value: 'CANCELED', label: 'Cancelado' },
  { id: 8, value: 'REFUNDED', label: 'Reembolsado' },
]

/**
 * It takes in a status string and returns a string that is used to style the
 * status badge
 * @param status - IStrapiOrder['attributes']['status']
 * @returns A string
 */
function getStatusStyle(status: IStrapiOrder['attributes']['status']) {
  switch (status) {
    case 'PAID':
      return 'badge-soft-success';
    case 'COMPLETED':
      return 'badge-soft-success';
    case 'CANCELED':
      return 'badge-soft-danger';
    case 'PENDING':
      return 'badge-soft-warning';
    case 'SHIPPING':
      return 'badge-soft-info';
    case 'FAILED':
      return 'badge-soft-danger';
  }
}

/**
 * It fetches orders from the Strapi API, and returns them in a format that's
 * easier to work with
 * @param params - Record<string, any>
 */

async function getOrders(
  ctx: Pick<NextPageContext, 'req'>,
  params: Record<string, any>,
) {
  const api = setupAPIClient(ctx);

  const orders = await api.get<{
    meta: {
      pagination: {
        total: number;
        pageCount: number;
        page: number;
      };
    };
    data: IStrapiOrder[];
  }>('/orders', {
    params: {
      publicationState: 'preview',
      populate: {
        billingAddress: {
          populate: '*'
        },
        shippingAddress: {
          populate: '*'
        },
        items: {
          populate: '*'
        },
        totals: {
          populate: '*'
        },
        customer: {
          populate: '*'
        },
        metaData: {
          populate: '*'
        },
        payment: {
          populate: '*'
        },
        coupons: {
          populate: '*'
        },
        shipping: {
          populate: '*'
        },
      },
      ...params,
    },
    paramsSerializer: (params) => {
      return QueryString.stringify(params);
    },
  });

  return {
    orders: orders.data.data.map(convert_order_strapi),
    totalPages: orders.data.meta.pagination.pageCount,
  };
}

const Orders: NextPageWithLayout<OrdersProps> = ({
  orders: initialOrders,
  totalPages: initialTotalPages,
}) => {
  const router = useRouter();
  const { config } = useSettings();
  const { handleChangeLoading } = useLayout();
  const [situation, setSituation] = useState<string | null>(null);
  const date = new Date().toISOString().slice(0, 10);
  const [orderDate, setOrderDate] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [currentStatus, setCurrentStatus] = useState('all');
  const [sortedBy, setSortedBy] = useState('createdAt:desc');
  const { user } = useAuth();

  const {
    data: { orders, totalPages },
    refetch: handleRefetchOrders,
  } = useQuery(
    ['orders', currentPage, sortedBy, currentStatus, orderDate, situation, currentPageSize],
    async () => {
      handleChangeLoading({
        description: 'Carregando pedidos',
        title: 'Aguarde',
      });

      try {
        const response = await getOrders(undefined, {
          pagination: {
            pageSize: currentPageSize,
            page: currentPage,
          },
          ...(sortedBy && {
            sort: sortedBy,
          }),
          filters: {
            ...(currentStatus !== 'all' && {
              status: {
                $eq: currentStatus,
              },
            }),
            ...(orderDate && {
              createdAt: {
                $gte: orderDate ? format(orderDate[0], 'yyyy-MM-dd') : date,
                $lt: orderDate ? format(addDays(orderDate[1], 1), 'yyyy-MM-dd') : date,
              },
            }),
            ...(situation &&
              !['-1'].includes(situation) && {
              payment: {
                method: {
                  $eq: situation,
                },
              },
            }),
            ...(search && {
              $or: [
                {
                  orderId: {
                    $containsi: search,
                  },
                },
                {
                  status: {
                    $eq:
                      Object.keys(orderStatuses).find((key) => {
                        const value: string = orderStatuses[key];

                        return value
                          .toLocaleLowerCase()
                          .includes(search.toLocaleLowerCase());
                      }) || '',
                  },
                },
                {
                  customer: {
                    firstName: {
                      $containsi: search,
                    },
                  },
                },
                {
                  customer: {
                    lastName: {
                      $containsi: search,
                    },
                  },
                },
                {
                  customer: {
                    email: {
                      $containsi: search,
                    },
                  },
                },
              ],
            }),
          },
        });

        return {
          orders: response.orders,
          totalPages: response.totalPages,
        };
      } finally {
        handleChangeLoading(null);
      }
    },
    {
      initialData: {
        orders: initialOrders,
        totalPages: initialTotalPages,
      },
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      initialDataUpdatedAt: 60 * 1000 * 5,
    },
  );

  /**
   * It fetches orders from the API, sets the current status, orders, total pages,
   * total, and current page
   * @param {string} tab - The current tab that the user is on.
   */
  const handleTabChange = async (tab: string) => {
    setCurrentStatus(tab);
    setCurrentPage(1);
  };

  /**
   * A function that handles the change of the order date.
   * @param {Date[]} dates - Date[] - The dates the user.
   */
  const handleOrderDateChange = async (dates: Date[]) => {
    setOrderDate(dates);
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(Number(router.query.page) || 1);
  }, [router.query.page]);

  const handlePageChange = useCallback(async (page: number) => {
    router.push(`/orders?page=${page}`, undefined, {
      shallow: true
    });
  }, []);

  /**
   * It fetches orders from the backend, and then sets the orders, total pages,
   * total, and current page to the state
   * @param {string} search - string - The search string
   */
  const handleSearch = async (search: string) => {
    try {
      setSearch(search);
      setCurrentPage(1);

      await handleRefetchOrders();
    } catch (e) {
      console.log(e);
    }
  };

  /* A function that is being called when the user clicks on the delete button. */
  const handleDeleteOrder = useCallback(
    async (id: number) => {
      try {
        await api.delete(`/orders/${id}`);

        await handleRefetchOrders();
      } catch (error) {
        toast.error('Erro ao excluir pedido');
      }
    },
    [handleRefetchOrders],
  );

  const handleChangeStatus = async (id: number, status: string) => {
    try {
      await api.put(`/orders/${id}`, {
        data: {
          status: status,
          updatedAt: new Date(),
        }
      });

      await handleRefetchOrders();
    } catch (error) {
      toast.error('Erro ao atualizar o status');
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce(handleSearch, 500), []);

  const columns = useMemo(() => {
    const baseColumns = [
      {
        Header: 'Id do pedido',
        accessor: 'orderId',
        filterable: false,
        Cell: (cellProps: CellProps) => (
          <span>{cellProps.row.original.orderId}</span>
        ),
      },
      {
        Header: 'Data do pedido',
        accessor: 'createdAt',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          return (
            <span className="d-block">
              {format(
                new Date(cellProps.row.original?.createdAt),
                'dd/MM/yyyy HH:mm',
                {
                  locale: ptBR,
                },
              )}
            </span>
          );
        },
      },
      {
        Header: 'Cliente',
        Cell: (cellProps: CellProps) => {
          return (
            <span className="d-block">
              {cellProps.row.original?.customer?.firstName}{' '}
              {cellProps.row.original?.customer?.lastName}
            </span>
          );
        },
      },
      {
        Header: 'Valor total',
        accessor: 'totals.total',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          return (
            <span className="d-block">
              {formatNumberToReal(cellProps.row.original?.totals?.total)}
            </span>
          );
        },
      },
      {
        Header: 'Comissão',
        accessor: 'commission',
        filterable: false,
        canSort: false,
        Cell: (cellProps: CellProps) => {
          const metaDataObject = user?.companies?.flatMap((company) => company?.metaData)?.find(metaData => metaData.key === 'commission');
          const commissionPercentage = metaDataObject?.valueFloat / 100;

          return (
            <span className="d-block">
              {Number.isNaN(commissionPercentage) ? 'R$ 0,00' : formatNumberToReal(cellProps.row.original?.totals?.total * commissionPercentage)}
            </span>
          );
        },
      },
      {
        Header: 'Forma de pagamento',
        accessor: 'payment.method',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          return (
            <span className="d-block">
              {paymentMethods[cellProps.row.original?.payment?.method] ??
                'Não informado'}
            </span>
          );
        },
      },
      {
        Header: 'Status da entrada',
        accessor: 'status',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          return (
            <ConfirmationModal
              changeStatus={(value) =>
                handleChangeStatus(cellProps.row.original.id, value as string)
              }
              title="Status do pedido"
              message="Tem certeza que deseja alterar o status do pedido?"
            >
              {(props) =>
                <select
                  className='form-select'
                  style={{
                    width: 'auto'
                  }}
                  aria-label="status"
                  id="pageSize"
                  value={cellProps.row.original?.status}
                  onChange={(e) => {
                    props.toggle(e.target.value)
                  }}
                >
                  {orderStatusTable.map((status) => (
                    <option
                      key={status.id}
                      value={status.value}
                    >
                      {status.label}
                    </option>
                  ))}
                </select>
              }
            </ConfirmationModal>
          );
        },
      },
      {
        Header: 'Ações',
        Cell: (cellProps: CellProps) => {
          return (
            <div className="d-flex gap-2 align-items-center">
              <div className="view">
                <Link
                  href={`/orders/${cellProps.row.original.id}`}
                  className="cursor-pointer fs-5"
                >
                  <i className="ri-eye-fill"></i>
                </Link>
              </div>
              <div className="delete">
                <ConfirmationModal
                  changeStatus={() =>
                    handleDeleteOrder(cellProps.row.original.id)
                  }
                  title="Excluir pedido"
                  message="Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita."
                >
                  <button className="btn btn-link shadow-none p-0 text-danger fs-5 text-decoration-none cursor-pointer">
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </ConfirmationModal>
              </div>
            </div>
          );
        },
      },
    ];

    let extraColumnIndex = 3;

    if (config?.custom_fields['activation_date']) {
      const extraColumn = {
        Header: 'Proxima Ativação',
        accessor: 'activationDate',
        filterable: false,
        Cell: (cellProps: CellProps) => {
          const activationDate = cellProps.row.original?.items?.map((item) => item?.metaData.find((item) => item.key === "activationDate"))
          const valueActivationDate = activationDate?.map((item) => item?.valueString)
          const today = new Date();

          let nextDate = null;
          valueActivationDate.forEach(dateString => {
            const date = new Date(dateString);
            if (!nextDate || date < nextDate) {
              if (date > today) {
                nextDate = date;
              }
            }
          });

          return (
            <span className="d-block">
              {activationDate ? (
                <>
                  {format(
                    new Date(nextDate),
                    'dd/MM/yyyy',
                    {
                      locale: ptBR,
                    },
                  )}
                </>
              ) : (
                <>
                  Sem data de ativação
                </>
              )}

            </span>
          );
        },
      };

      baseColumns.splice(extraColumnIndex, 0, extraColumn);
    }

    return baseColumns;
  }, [handleDeleteOrder, config?.custom_fields['activation_date'], user]);

  const handleSortBy = useCallback(
    async (sortBy: string, order: 'desc' | 'asc') => {
      setSortedBy(`${sortBy}:${order}`);
      setCurrentPage(1);
    },
    [],
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

  return (
    <div className="page-content">
      <Head>
        <title>Pedidos - GrowForce</title>
      </Head>
      <BreadCrumb title="Pedidos" pageTitle="Ecommerce" />

      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header className="card-header">
              <div className="d-flex align-items-center">
                <h5 className="card-title mb-0 flex-grow-1">
                  Histórico de pedidos
                </h5>
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
                          placeholder="Pesquise por ID do pedido, cliente, status do pedido ou algo assim..."
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

                  <Col lg={3}>
                    <div className="position-relative">
                      <Flatpickr
                        placeholder="Selecione a data"
                        className="form-control"
                        id="orderDate"
                        options={{
                          mode: 'range',
                          dateFormat: 'd/m/Y',
                          locale: flatpickrPt,
                        }}
                        value={orderDate}
                        onChange={handleOrderDateChange}
                        style={{
                          paddingRight: '30px',
                        }}
                      />

                      <Button
                        close
                        color="link"
                        className="shadow-none text-danger"
                        style={{
                          position: 'absolute',
                          top: '50%',
                          right: '10px',
                          transform: 'translateY(-50%)',
                        }}
                        onClick={() => setOrderDate(null)}
                      />
                    </div>
                  </Col>

                  <Col lg={3}>
                    <select
                      className="form-select"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '0') {
                          setSituation(null);
                          return;
                        }

                        setSituation(e.target.value);
                      }}
                      value={situation}
                    >
                      <option value="0">Formas de Pagamentos</option>
                      <option value="credit_card">Cartão de Crédito</option>
                      <option value="pix">Pix</option>
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
                      <i className=" ri-equalizer-fill align-bottom me-2"></i>
                      Filtros
                    </Button>
                  </Col>
                </Row>
              </div>

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
                            <i className="ri-add-line align-bottom me-2"></i>
                            Todos os pedidos
                          </>
                        ),
                        content: <span />,
                        id: 'all',
                      },
                      {
                        title: (
                          <>
                            <i className="ri-checkbox-circle-line align-bottom me-2"></i>
                            Entregues
                          </>
                        ),
                        content: <span />,
                        id: 'COMPLETED',
                      },
                      {
                        title: (
                          <>
                            <i className="ri-truck-line align-bottom me-2"></i>
                            Com a transportadora
                            {/*<span className="badge bg-danger align-middle ms-1">
                              2
                            </span>*/}
                          </>
                        ),
                        content: <span />,
                        id: 'SHIPPING',
                      },
                      {
                        title: (
                          <>
                            <i className="ri-arrow-left-right-line align-bottom me-2"></i>
                            Devoluções
                          </>
                        ),
                        content: <span />,
                        id: 'REFUNDED',
                      },
                      {
                        title: (
                          <>
                            <i className="ri-close-circle-line align-bottom me-2"></i>
                            Cancelado
                          </>
                        ),
                        content: <span />,
                        id: 'CANCELED',
                      },
                    ]}
                    tabs
                    className="nav-tabs-custom card-header-tabs border-bottom-0"
                    onTabChange={handleTabChange}
                  />
                </div>

                <TableContainer
                  columns={columns}
                  data={orders || []}
                  customPageSize={currentPageSize}
                  divClass="table-responsive mb-1"
                  tableClass="mb-0 align-middle table-borderless"
                  theadClass="table-light text-muted"
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onChangePage={handlePageChange}
                  onSortBy={handleSortBy}
                  sortedBy={orderBy}
                  setCurrentPageSize={setCurrentPageSize}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const props = await getOrders(ctx, {});

  return {
    props: {
      ...props,
    },
  };
});

export default Orders;

Orders.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
