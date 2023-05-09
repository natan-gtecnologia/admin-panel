import qs from "qs";
import { NextPageWithLayout } from "../../@types/next";
import { setupAPIClient } from "../../services/api";
import { convert_livestream_strapi } from "../../utils/convertions/convert_live_stream";
import { withSSRAuth } from "../../utils/withSSRAuth";
import { ILiveStream } from "../../@types/livestream";
import { IChat } from "../../@types/chat";
import Layout from "../../containers/Layout";
import { convert_chat_strapi } from "../../utils/convertions/convert_chat";
import { z } from "zod";
import { NextPageContext } from "next";
import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TableContainer from "@/components/Common/TableContainer";
import { Card } from "@/components/Common/Card";
import Head from "next/head";
import BreadCrumb from "@/components/Common/BreadCrumb";
import { Badge, Button, Col, Row } from "reactstrap";
import Link from "@/components/Common/Link";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';


const statusColors = {
    enabled: 'primary',
    disabled: 'danger',
    finished: 'success'
};

const statusDescriptions = {
    enabled: 'Em Andamento',
    disabled: 'Agendada',
    finished: 'Realizada'
};

type LiveStreamProps = {
    liveStream: ILiveStream;
    // chat: IChat;

};

type CellProps = {
    row: {
        original: ILiveStream;
    };
};

async function getLiveStream(
    ctx: Pick<NextPageContext, 'req'>,
    params?: Record<string, any>,
) {
    const apiClient = setupAPIClient(ctx);
    const liveStreams = await apiClient.get('live-streams', {
        params: {
            ...params
        }
    });

    console.log("liveStream", liveStreams.data.data.map(convert_livestream_strapi))

    return {
        // liveStream: []
        liveStream: liveStreams.data.data.map(convert_livestream_strapi),
    };
}

const ListLiveStream: NextPageWithLayout<LiveStreamProps> = ({
    liveStream: initialLiveStream
}) => {

    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageSize, setCurrentPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [sortedBy, setSortedBy] = useState('');
    const {
        data: { liveStream },
        refetch: handleRefetchLives,
    } = useQuery(
        ['liveStream', currentPage, sortedBy, currentPageSize],
        async () => {
            const response = await getLiveStream(undefined, {
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
                        ],
                    }),
                },
            });

            return {
                liveStream: response.liveStream,
                // totalPages: response.totalPages,
            };
        },
        {
            initialData: {
                liveStream: initialLiveStream,
                // totalPages: initialTotalPages,
            },
            refetchOnWindowFocus: false,
            keepPreviousData: true,
        },
    );

    console.log("liveStream", liveStream)

    const columns = useMemo(
        () => [
            {
                Header: (
                    <input
                        type="checkbox"
                        id="checkBoxAll"
                        className="form-check-input"
                    // onChange={checkedAll}
                    // checked={deleteIds.length === tags.length && deleteIds.length > 0}
                    />
                ),
                Cell: (cellProps: CellProps) => {
                    return (

                        <input
                            type="checkbox"
                            className="customerCheckBox form-check-input"
                            value={cellProps.row.original.id}
                        //   checked={deleteIds.includes(cellProps.row.original.id)}
                        //   onChange={(e) => {
                        //     setDeleteIds((oldValues) => {
                        //       if (oldValues.includes(cellProps.row.original.id)) {
                        //         return oldValues.filter(
                        //           (value) => value !== cellProps.row.original.id,
                        //         );
                        //       }

                        //       return [...oldValues, cellProps.row.original.id];
                        //     });
                        //   }}
                        />
                    );
                },
                id: '#',
            },
            {
                Header: 'Código da live',
                accessor: 'id',
                filterable: false,
                Cell: (cellProps: CellProps) => (
                    <span>{cellProps.row.original.uuid}</span>
                ),
            },
            {
                Header: 'Status',
                accessor: 'status',
                filterable: false,
                Cell: (cellProps: CellProps) => {
                    const status = cellProps.row.original.state;
                    const color = statusColors[status] || 'secondary';
                    const description = statusDescriptions[status] || status;

                    return (
                        <>
                            <Badge color={color}>{description}</Badge>
                        </>
                    );
                },
            },
            {
                Header: 'Título da live ',
                accessor: 'title',
                filterable: false,
                Cell: (cellProps: CellProps) => {
                    return <span className="d-block">{cellProps.row.original.title}</span>;
                },
            },
            {
                Header: 'Tema da live ',
                accessor: 'theme',
                filterable: false,
                Cell: (cellProps: CellProps) => {
                    return <span className="d-block">{cellProps.row.original.liveEventName}</span>;
                },
            },
            {
                Header: 'Previsão de Inicio ',
                accessor: 'startedDate',
                filterable: false,
                Cell: (cellProps: CellProps) => {
                    return <span className="d-block">
                        {
                            cellProps.row.original?.startedDate ?
                                format(new Date(cellProps.row.original?.startedDate), 'dd/MM/Y HH:mm', {
                                    locale: ptBR,
                                }) : (
                                    <>
                                        -
                                    </>
                                )
                        }
                    </span>;
                },
            },
            {
                Header: 'Inicio Efetivo',
                accessor: 'effectiveStart',
                filterable: false,
                Cell: (cellProps: CellProps) => {
                    return <span className="d-block">
                        {
                            cellProps.row.original?.schedule ?
                                format(new Date(cellProps.row.original?.schedule), 'dd/MM/Y HH:mm', {
                                    locale: ptBR,
                                }) : (
                                    <>
                                        -
                                    </>
                                )
                        }
                    </span>;
                },
            },
            {
                Header: 'Termino',
                accessor: 'endedDate',
                filterable: false,
                Cell: (cellProps: CellProps) => {
                    return <span className="d-block">
                        {
                            cellProps.row.original?.endedDate ?
                                format(new Date(cellProps.row.original?.endedDate), 'dd/MM/Y HH:mm', {
                                    locale: ptBR,
                                }) : (
                                    <>
                                        -
                                    </>
                                )
                        }
                    </span>;
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
                                    href={`/live-stream/edit/${cellProps.row.original.id}`}
                                    className="cursor-pointer"
                                    aria-label="Editar live-stream"
                                >
                                    <i className="ri-pencil-fill"></i>
                                </Link>
                            </div>
                            <div className="clone">
                                <ConfirmationModal
                                    changeStatus={() => { }
                                        // handleDeleteTag(cellProps.row.original.id)
                                    }
                                    title="Excluir tag"
                                    message="Tem certeza que deseja excluir essa tag? Essa ação não pode ser desfeita."
                                >
                                    <button
                                        className="btn btn-link shadow-none p-0 text-danger fs-5 text-decoration-none cursor-pointer"
                                        aria-label="Deletar tag"
                                    >
                                        <i className="ri-file-copy-line"></i>
                                    </button>
                                </ConfirmationModal>
                            </div>
                        </div>
                    );
                },
            },
        ],
        [liveStream.length]
        // [checkedAll, deleteIds, handleDeleteTag, tags.length],
    );

    const handleChangePage = useCallback(async (page: number) => {
        setCurrentPage(page);
    }, []);

    const handleSortBy = useCallback(
        async (sortBy: string, order: 'desc' | 'asc') => {
            setCurrentPage(1);
            setSortedBy(`${sortBy}:${order}`);
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
                <title>Live-stream - Dashboard</title>
            </Head>

            <BreadCrumb title="Tags" pageTitle="Ecommerce" />

            <Row>
                <Col lg={12}>
                    <Card>
                        <Card.Header className="card-header">
                            <div className="d-flex align-items-center">
                                <h5 className="card-title mb-0 flex-grow-1">Lista de Lives</h5>
                                <div className="flex-shrink-0">
                                    <Link
                                        href={'/tags/create'}
                                        className="btn shadow-none btn-success"
                                    >
                                        <i className="ri-add-line align-bottom me-1"></i>
                                        Adicionar Live
                                    </Link>{' '}
                                    {/* {deleteIds.length > 0 && (
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
                                    )} */}
                                </div>
                            </div>
                        </Card.Header>

                        <Card.Body>
                            <div id="liveStreamList">
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
                                                        // debouncedSearch(e.target.value);
                                                    }}
                                                />
                                                <i className="ri-search-line search-icon"></i>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                            <div>
                                <TableContainer
                                    columns={columns}
                                    data={liveStream}
                                    customPageSize={10}
                                    divClass="table-responsive mb-1"
                                    tableClass="mb-0 align-middle table-borderless"
                                    theadClass="table-light text-muted"
                                    currentPage={currentPage}
                                    onChangePage={handleChangePage}
                                    totalPages={100}
                                    onSortBy={handleSortBy}
                                    sortedBy={orderBy}
                                    setCurrentPageSize={setCurrentPageSize}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* {isDeleting && <Loader loading={null} />} */}
        </div>
    )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
    const liveStream = await getLiveStream(ctx);

    return {
        props: liveStream,
    };
});

export default ListLiveStream;

ListLiveStream.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;