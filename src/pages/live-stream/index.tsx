import BreadCrumb from "@/components/Common/BreadCrumb";
import { Card } from "@/components/Common/Card";
import Link from "@/components/Common/Link";
import Loader from "@/components/Common/Loader";
import TableContainer from "@/components/Common/TableContainer";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useLayout } from "@/hooks/useLayout";
import { api } from "@/services/apiClient";
import { useQuery } from "@tanstack/react-query";
import format from "date-fns/format";
import ptBR from "date-fns/locale/pt-BR";
import debounce from "lodash/debounce";
import { NextPageContext } from "next";
import Head from "next/head";
import QueryString from "qs";
import { useCallback, useMemo, useState } from "react";
import type { CellProps } from "react-table";
import { toast } from "react-toastify";
import { Badge, Col, Row } from "reactstrap";
import { ILiveStream } from "../../@types/livestream";
import type { NextPageWithLayout } from "../../@types/next";
import Layout from "../../containers/Layout";
import { setupAPIClient } from "../../services/api";
import { convert_livestream_strapi } from "../../utils/convertions/convert_live_stream";
import { withSSRAuth } from "../../utils/withSSRAuth";

const customStyle = {
  "--vz-aspect-ratio": "100%",
} as React.CSSProperties;

const statusColors = {
  enabled: "primary",
  disabled: "danger",
  testing: 'warning',
  finished: "success",
};

const statusDescriptions = {
  enabled: "Em Andamento",
  disabled: "Agendada",
  testing: 'Em Teste',
  finished: "Realizada",
};

type LiveStreamProps = {
  liveStream: ILiveStream;
  totalPages: number;
};

async function getLiveStream(
  ctx: Pick<NextPageContext, "req"> | undefined,
  params: Record<string, any> = { pagination: { pageSize: 10 } }
) {
  const apiClient = setupAPIClient(ctx);
  const liveStreams = await apiClient.get("live-streams", {
    params: {
      populate: {
        broadcasters: {
          populate: {
            broadcaster: {
              populate: {
                avatar: {
                  populate: "*",
                },
              },
            },
          },
        },
        bannerLive: "*",
        chat: {
          populate: "*",
        },
        streamProducts: {
          populate: "*",
        },
        metaData: {
          populate: "*",
        },
      },
      pagination: {
        ...params.pagination,
      },
      ...params,
    },
    paramsSerializer: {
      serialize: (params) => {
        return QueryString.stringify(params);
      },
    },
  });

  return {
    liveStream: liveStreams.data.data.map(convert_livestream_strapi) ?? [],
    totalPages: liveStreams.data.meta?.pagination?.pageCount ?? 1,
  };
}

const ListLiveStream: NextPageWithLayout<LiveStreamProps> = ({
  liveStream: initialLiveStream,
  totalPages: initialTotalPages,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortedBy, setSortedBy] = useState("");
  const { handleChangeLoading } = useLayout();
  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: { liveStream, totalPages },
    refetch: handleRefetchLives,
  } = useQuery(
    ["liveStream", currentPage, sortedBy, currentPageSize],
    async () => {
      // handleChangeLoading({
      //   description: 'Carregando lives',
      //   title: 'Aguarde',
      // });

      const response = await getLiveStream(undefined, {
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
                id: {
                  $containsi: search,
                },
              },
              {
                title: {
                  $containsi: search,
                },
              },
              {
                status: {
                  $containsi: search,
                },
              },
            ],
          }),
        },
      });

      return {
        liveStream: response.liveStream,
        totalPages: response.totalPages,
      };
    },
    {
      initialData: {
        liveStream: initialLiveStream,
        totalPages: initialTotalPages,
      },
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );

  const checkedAll = useCallback(() => {
    setDeleteIds((oldValues) => {
      if (oldValues.length === liveStream.length) {
        return [];
      } else {
        return liveStream.map((live: ILiveStream) => live.id);
      }
    });
  }, [liveStream]);

  const handleChangePage = useCallback(async (page: number) => {
    setCurrentPage(page);
  }, []);

  const handleDeleteLives = useCallback(async () => {
    setIsDeleting(true);
    try {
      for (const id of deleteIds) {
        await api.delete(`/live-streams/${id}`);
      }

      await handleRefetchLives();
      setDeleteIds([]);
    } catch (error) {
      toast.error("Erro ao excluir a(s) live(s)");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteIds, handleRefetchLives]);

  const handleSortBy = useCallback(
    async (sortBy: string, order: "desc" | "asc") => {
      setCurrentPage(1);
      setSortedBy(`${sortBy}:${order}`);
    },
    []
  );

  const handleSearch = useCallback(
    async (search: string) => {
      setSearch(search);
      setCurrentPage(1);

      await handleRefetchLives();
    },
    [handleRefetchLives]
  );

  const orderBy = useMemo(() => {
    const [id, desc] = sortedBy.split(":");

    return [
      {
        id,
        desc: desc === "desc",
      },
    ];
  }, [sortedBy]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce(handleSearch, 500), []);

  const url = liveStream.find((item: ILiveStream) => item.state === "enabled")

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
              deleteIds.length === liveStream.length && deleteIds.length > 0
            }
          />
        ),
        Cell: (cellProps: CellProps<ILiveStream>) => {
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
                      (value) => value !== cellProps.row.original.id
                    );
                  }

                  return [...oldValues, cellProps.row.original.id];
                });
              }}
            />
          );
        },
        id: "#",
        width: "4%",
      },
      {
        Header: "Código da live",
        accessor: "id",
        filterable: false,
        Cell: (cellProps: CellProps<ILiveStream>) => (
          <span>{cellProps.row.original.uuid}</span>
        ),
      },
      {
        Header: "Status",
        accessor: "status",
        filterable: false,
        Cell: (cellProps: CellProps<ILiveStream>) => {
          const status = cellProps.row.original.state;
          const color = statusColors[status] || "secondary";
          const description = statusDescriptions[status] || status;

          return (
            <>
              <Badge className="px-3" color={color}>
                {description}
              </Badge>
            </>
          );
        },
      },
      {
        Header: "Título da live ",
        accessor: "title",
        filterable: false,
        Cell: (cellProps: CellProps<ILiveStream>) => {
          return (
            <span className="d-block">{cellProps.row.original.title}</span>
          );
        },
      },
      {
        Header: "Descrição ",
        accessor: "description",
        filterable: false,
        Cell: (cellProps: CellProps<ILiveStream>) => {
          return (
            <>
              {cellProps.row.original?.liveDescription ? (
                <span className="d-block">
                  {cellProps.row.original.liveDescription}
                </span>
              ) : (
                <>
                  <span> - </span>
                </>
              )}
            </>
          );
        },
      },
      {
        Header: "Previsão de Inicio ",
        accessor: "startedDate",
        filterable: false,
        Cell: (cellProps: CellProps<ILiveStream>) => {
          return (
            <span className="d-block">
              {cellProps.row.original?.startedDate ? (
                format(
                  new Date(cellProps.row.original?.startedDate),
                  "dd/MM/Y HH:mm",
                  {
                    locale: ptBR,
                  }
                )
              ) : (
                <>-</>
              )}
            </span>
          );
        },
      },
      {
        Header: "Inicio Efetivo",
        accessor: "effectiveStart",
        filterable: false,
        Cell: (cellProps: CellProps<ILiveStream>) => {
          return (
            <span className="d-block">
              {cellProps.row.original?.schedule ? (
                format(
                  new Date(cellProps.row.original?.schedule),
                  "dd/MM/Y HH:mm",
                  {
                    locale: ptBR,
                  }
                )
              ) : (
                <>-</>
              )}
            </span>
          );
        },
      },
      {
        Header: "Termino",
        accessor: "endedDate",
        filterable: false,
        Cell: (cellProps: CellProps<ILiveStream>) => {
          return (
            <span className="d-block">
              {cellProps.row.original?.endedDate ? (
                format(
                  new Date(cellProps.row.original?.endedDate),
                  "dd/MM/Y HH:mm",
                  {
                    locale: ptBR,
                  }
                )
              ) : (
                <>-</>
              )}
            </span>
          );
        },
      },
      {
        Header: "Ações",
        canSort: false,
        Cell: (cellProps: CellProps<ILiveStream>) => {
          return (
            <div className="d-flex gap-3">
              <div className="edit d-flex align-items-center">
                <Link
                  href={`/live-stream/editar/${cellProps.row.original.id}`}
                  className="cursor-pointer"
                  aria-label="Editar live-stream"
                >
                  <i className="ri-pencil-fill"></i>
                </Link>
              </div>
              <div className="edit d-flex align-items-center">
                <Link
                  href={`/live-stream/${cellProps.row.original.uuid}`}
                  className="cursor-pointer"
                  aria-label="Gerenciar live-stream"
                >
                  <i className="ri-eye-line"></i>
                </Link>
              </div>
              <div className="clone">
                {/* <ConfirmationModal
                  changeStatus={
                    () => { }
                    // handleDeleteTag(cellProps.row.original.id)
                  }
                  title="Excluir tag"
                  message="Tem certeza que deseja excluir essa tag? Essa ação não pode ser desfeita."
                >
                </ConfirmationModal> */}
                <button
                  className="btn btn-link shadow-none p-0 text-danger fs-5 text-decoration-none cursor-pointer"
                  aria-label="Deletar tag"
                >
                  <i className="ri-file-copy-line"></i>
                </button>
              </div>
            </div>
          );
        },
      },
    ],
    [checkedAll, deleteIds, liveStream.length]
  );

  const [displayValue, setDisplayValue] = useState<"block" | "none">("block");
  const [isMinimized, setIsMinimized] = useState(false);
  const [cardClassName, setCardClassName] = useState("");

  const handleChatBox = () => {
    if (isMinimized) {
      setDisplayValue("block");
      setCardClassName("");
    } else {
      setCardClassName("minimized");
    }
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      <div className="page-content">
        <Head>
          <title>Live-stream - Dashboard Liveforce</title>
        </Head>

        <BreadCrumb title="Lives" pageTitle="Ecommerce" />

        <Row>
          <Col lg={12}>
            <Card>
              <Card.Header className="card-header">
                <div className="d-flex align-items-center">
                  <h5 className="card-title mb-0 flex-grow-1">
                    Lista de Lives
                  </h5>
                  <div className="flex-shrink-0">
                    <Link
                      href={"/live-stream/criar"}
                      className="btn shadow-none btn-success"
                    >
                      <i className="ri-add-line align-bottom me-1"></i>
                      Adicionar Live
                    </Link>{" "}
                    {deleteIds.length > 0 && (
                      <ConfirmationModal
                        changeStatus={handleDeleteLives}
                        title="Excluir lives"
                        message="Tem certeza que deseja excluir essas lives? Essa ação não pode ser desfeita."
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

              <Card.Body className="card-body">
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
                </Row>

                <div>
                  <TableContainer
                    columns={columns}
                    data={liveStream}
                    customPageSize={currentPageSize}
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

          <Col md={1}>
            <div
              className="email-chat-detail"
              id="emailchat-detailElem"
              style={{ display: displayValue }}
            >
              <Card className={cardClassName}>
                <Card.Header className="pb-0">
                  <div className="align-items-end d-flex justify-content-end gap-4">
                    <a
                      className="fs-18 text-decoration-none cursor-pointer"
                      id="btn"
                      onClick={handleChatBox}
                    >
                      {isMinimized ? (
                        <i className="ri-arrow-up-s-line"></i>
                      ) : (
                        <i className="ri-arrow-down-s-line"></i>
                      )}
                    </a>
                    <a
                      className="fs-18 text-decoration-none cursor-pointer"
                      id="btn-close"
                      onClick={() => setDisplayValue("none")}
                    >
                      <i className="ri-close-fill"></i>
                    </a>
                  </div>
                </Card.Header>

                <Card.Body className="p-0">
                  <div className="ratio ratio-1x1">
                    <iframe
                      src={`${process.env.NEXT_PUBLIC_LIVE_URL}/${url.uuid}?step=live-room`}
                      title="YouTube video"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="p-2">
                    <h5>Live Naluzetes</h5>
                    <span>01:00:00</span>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </div>

      {isDeleting && <Loader loading={null} />}
    </>
  );
};

export const getServerSideProps = withSSRAuth<LiveStreamProps>(async (ctx) => {
  try {
    const liveStream = await getLiveStream(ctx, {});

    return {
      props: liveStream,
    };
  } catch (err) {
    console.log("err", err);
    return {
      props: {
        liveStream: [],
        totalPages: 1,
      },
    };
  }
});

export default ListLiveStream;

ListLiveStream.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
