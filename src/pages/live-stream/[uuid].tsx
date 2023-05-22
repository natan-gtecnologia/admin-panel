import { useCallback, useEffect, useState } from "react";
import { NextPageWithLayout } from "../../@types/next";
import Layout from "../../containers/Layout";

import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import io, { type Socket } from "socket.io-client";
import { withSSRAuth } from "../../utils/withSSRAuth";

import {
  Col,
  Row
} from "reactstrap";

import { setupAPIClient } from "../../services/api";

import BreadCrumb from "@/components/Common/BreadCrumb";
import { Card } from "@/components/Common/Card";
import { LiveTabs } from "@/components/LiveStream/Live";
import { LiveBroadcasters } from "@/components/LiveStream/Live/Broadcasters";
import { LiveCoupons } from "@/components/LiveStream/Live/Coupons";
import { GenerealConfigs } from "@/components/LiveStream/Live/GeneralConfigs";
import { HighlightedProducts } from "@/components/LiveStream/Live/HighlightedProducts";
import { SaleProducts } from "@/components/LiveStream/Live/SaleProducts";
import { useAuth } from "@/contexts/AuthContext";
import { useLayout } from "@/hooks/useLayout";
import { convert_livestream_strapi } from "@/utils/convertions/convert_live_stream";
import QueryString from "qs";
import { toast } from "react-toastify";
import { z } from "zod";
import { IChat } from "../../@types/chat";
import { ILiveStream } from "../../@types/livestream";
import { convert_chat_strapi } from "../../utils/convertions/convert_chat";

type LiveStreamProps = {
  liveStream: ILiveStream;
  chat: IChat;
};

interface IMessage {
  id: string | number;
  image?: string;
  author: string;
  message: string;
  firstName: string;
  type?: "system";
  exclusion: any;
}

const customStyle = {
  "--vz-aspect-ratio": "177.77%",
} as React.CSSProperties;

export async function getLivestream({
  id,
  isUUID = false,
  ctx = undefined,
}: {
  id: string;
  isUUID?: boolean;
  ctx?: any;
}) {
  let prefix = "";

  if (isUUID) {
    prefix = "uuid/";
  }

  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get(`/live-streams/${prefix}${id}`, {
    params: {
      populate: {
        broadcasters: {
          populate: {
            broadcaster: {
              populate: {
                avatar: {
                  populate: "*"
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
          populate: "*"
        },
        metaData: {
          populate: "*"
        },
      },
    },
    paramsSerializer: {
      serialize: (params) => {
        return QueryString.stringify(params);
      }
    },
  });

  const formattedLivestream = convert_livestream_strapi(response.data.data);

  return formattedLivestream;
}

let socketConnection: Socket;
const LiveStream: NextPageWithLayout<LiveStreamProps> = ({
  liveStream: initialLiveStream,
  chat,
}) => {
  const { user } = useAuth();

  const { data: liveStream, refetch: handleRefetchLiveStream } = useQuery(
    ["liveStream", 'room', initialLiveStream.id],
    async () => {
      const response = await getLivestream({
        id: initialLiveStream.uuid,
        isUUID: true,
      });

      return response;
    },
    {
      initialData: initialLiveStream,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );

  const [message, setMessage] = useState("");
  const { handleChangeLoading } = useLayout();
  const [messagesFromSocket, setMessagesFromSocket] = useState<IMessage[]>([]);
  const [usersFromSocket, setUsersFromSocket] = useState<
    {
      id: string;
      firstName: string;
      lastName: string;
      image: string;
    }[]
  >([]);

  const messages = [...chat.messages, ...messagesFromSocket];

  const handleSendMessage = async () => {
    if (!message || !socketConnection || !user || !user.firstName) return;

    socketConnection?.emit("message:send", {
      chat_id: chat.id,
      firstName: user?.firstName,
      author: 0,
      message,
      datetime: new Date(),
      moderator: true,
    });

    setMessage("");
  };

  useEffect(() => {
    socketConnection = io(process.env.NEXT_PUBLIC_BACKEND!);

    socketConnection.on("connect", () => {
      console.log("SOCKET ADMIN CONNECTED", socketConnection.id);
    });

    socketConnection.emit("chat:join", {
      chat_id: chat.id,
      type: "system",
    });

    socketConnection.on("message:received", (message) => {
      setMessagesFromSocket((oldMessages) => [...oldMessages, message]);
    });

    socketConnection.on("user:joined", (user) => {
      setUsersFromSocket((oldUsers) => [...oldUsers, user]);
    });

    return () => {
      socketConnection.disconnect();
    };
  }, [chat.id]);


  const handleBlockUser = useCallback(async (user: any) => {
    handleChangeLoading({
      description: 'Carregando lives',
      title: 'Aguarde',
    });
    console.log("user", user)

    try {
      // await api.post(`/black-lists`, {
      //   data: {

      //   }
      // });

      // await handleRefetchLiveStream();
    } catch (error) {
      toast.error("Erro ao excluir bloquar usuário");
    } finally {
      toast.error("Usuário bloqueado com sucesso");
      handleChangeLoading(null)
    }
  }, [handleChangeLoading]);

  return (
    <>
      <div className="page-content">
        <Head>
          <title>Gerenciamento da Live - Dashboard Liveforce</title>
        </Head>

        <BreadCrumb title="Em Execução" pageTitle="LiveStream" />

        <Row>
          <Col lg={12}>
            <Card>
              <Card.Header>
                <h6 className="card-title mb-0 flex-grow-1">
                  Naluzetes <span style={{ color: "#0AB39C" }}>Ao vivo</span>
                </h6>
              </Card.Header>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <Card>
              <Card.Header className="card-header">
                <div className="d-flex align-items-center">
                  <h5 className="card-title mb-0 flex-grow-1">
                    Gerenciamento da Live
                  </h5>
                </div>
              </Card.Header>

              <Card.Body>
                <Row>
                  <Col lg={4}>
                    <div className="ratio ratio-9x16" style={customStyle}>
                      <iframe
                        src={`${process.env.NEXT_PUBLIC_LIVE_URL}/${liveStream.uuid}?step=live-room`}
                        title="YouTube video"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </Col>

                  <LiveTabs
                    messages={messages}
                    message={message}
                    setMessage={setMessage}
                    handleSendMessage={handleSendMessage}
                    usersFromSocket={usersFromSocket}
                    handleBlockUser={handleBlockUser}
                  />

                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <GenerealConfigs
              liveId={liveStream.id}
              chat={liveStream.chat}
              timeout={liveStream.timeout}
            />
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <SaleProducts products={liveStream.streamProducts.map(product => ({
              steam_product_id: product.id,
              metaData: product?.metaData,
              id: product.product.id,
              product: product.product,
              highlighted: product.highlight,
              livePrice: product.price?.salePrice ?? product.price.regularPrice,
            }))}
              liveId={liveStream.id}
              liveUUID={liveStream.uuid}
            />
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <HighlightedProducts products={liveStream.streamProducts.map(product => ({
              steam_product_id: product.id,
              id: product.product.id,
              product: product.product,
              highlighted: product.highlight,
              livePrice: product.price?.salePrice ?? product.price.regularPrice,
            }))}
              liveId={liveStream.id} />
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <LiveCoupons coupons={liveStream.coupons} liveId={liveStream.id} />
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <LiveBroadcasters broadcasters={liveStream.broadcasters} liveId={liveStream.id} />
          </Col>
        </Row>
      </div>
    </>
  );
};

export const getServerSideProps = withSSRAuth<LiveStreamProps>(async (ctx) => {
  const apiClient = setupAPIClient(ctx);

  try {
    const { uuid } = z
      .object({
        uuid: z.string().uuid(),
      })
      .parse(ctx.params);

    const liveStream = await getLivestream({
      id: uuid,
      isUUID: true,
      ctx,
    });

    const chats = await apiClient.get("/chats", {
      params: {
        populate: {
          liveStream: {
            populate: "*",
          },
          users: {
            populate: "*",
          },
          messages: {
            populate: "*",
          },
        },
        filters: {
          liveStream: {
            id: {
              $eq: liveStream.id,
            },
          },
        },
      },
      paramsSerializer: {
        serialize: (params) => {
          return QueryString.stringify(params);
        }
      },
    });

    const chat = chats.data.data[0];

    if (!chat) {
      throw new Error("no chat available");
    }

    return {
      props: {
        chat: convert_chat_strapi(chat),
        liveStream,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      notFound: true,
    };
  }
});

export default LiveStream;

LiveStream.getLayout = (page, logo) => <Layout logo={logo}>{page}</Layout>;
