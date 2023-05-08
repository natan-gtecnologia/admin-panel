import BreadCrumb from "@growth/growforce-admin-ui/components/Common/BreadCrumb";
import { Card } from "@growth/growforce-admin-ui/components/Common/Card";
import { useEffect, useState } from "react";
import { NextPageWithLayout } from "../../@types/next";
import Layout from "../../containers/Layout";

import { Col, Row } from "@growth/growforce-admin-ui/index";
import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import qs from "qs";
import io from "socket.io-client";
import { withSSRAuth } from "../../utils/withSSRAuth";

import {
  ListGroup,
  ListGroupItem,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";

import classnames from "classnames";
import SimpleBar from "simplebar-react";
import { setupAPIClient } from "../../services/api";

import { convert_livestream_strapi } from "apps/growforce/admin-panel/utils/convertions/convert_live_stream";
import { z } from "zod";
import { IChat } from "../../@types/chat";
import { ILiveStream } from "../../@types/livestream";
import { useSettings } from "../../contexts/SettingsContext";
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
        chat: {
          populate: "*",
        },
      },
    },
    paramsSerializer: (params) => {
      return qs.stringify(params);
    },
  });

  const formattedLivestream = convert_livestream_strapi(response.data.data);

  return formattedLivestream;
}

const LiveStream: NextPageWithLayout<LiveStreamProps> = ({
  liveStream: initialLiveStream,
  chat,
}) => {
  const { config } = useSettings();

  const [activeTab, setActiveTab] = useState(1);
  const [passedSteps, setPassedSteps] = useState([1]);

  const { data: liveStream, refetch: handleRefetchLiveStream } = useQuery(
    ["liveStream"],
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
  const [messagesFromSocket, setMessagesFromSocket] = useState<IMessage[]>([]);
  const [usersFromSocket, setUsersFromSocket] = useState([]);

  const messages = [...chat.messages, ...messagesFromSocket];

  async function toggleTab(tab: number): Promise<void> {
    if (activeTab !== tab) {
      const modifiedSteps = [...passedSteps, tab];

      if (tab >= 1 && tab <= 5) {
        setActiveTab(tab);
        setPassedSteps(modifiedSteps);
      }
    }
  }

  const handleSendMessage = async () => {
    const socketConnection = io(config.socket_url);

    if (!message) return;

    socketConnection?.emit("message:send", {
      chat_id: chat.id,
      firstName: "Moderador",
      author: 0,
      message,
      datetime: new Date(),
    });

    setMessage("");
  };

  useEffect(() => {
    if (!config) return;
    const socketConnection = io(config.socket_url);

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
  }, [config?.socket_url]);

  return (
    <>
      <div className="page-content">
        <Head>
          <title>Gerenciamento da Live - Dashboard</title>
        </Head>

        <BreadCrumb title="Nova Live" pageTitle="Ecommerce" />

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
                        src={`http://localhost:3000/${liveStream.uuid}?step=live-room`}
                        title="YouTube video"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </Col>

                  <Col lg={8} style={{ height: "60%" }}>
                    <Nav
                      tabs
                      className="nav nav-tabs nav-tabs-custom nav-success nav-justified mb-3"
                    >
                      <NavItem role="chat">
                        <NavLink
                          href="#"
                          className={classnames(
                            {
                              active: activeTab === 1,
                              done: activeTab <= 4 && activeTab >= 0,
                            },
                            "fs-15 p-3"
                          )}
                          onClick={() => {
                            toggleTab(1);
                          }}
                        >
                          <i className="ri-message-2-fill fs-16 p-1 align-middle me-1"></i>
                          Chat
                        </NavLink>
                      </NavItem>
                      <NavItem role="users">
                        <NavLink
                          href="#"
                          className={classnames(
                            {
                              active: activeTab === 2,
                              done: activeTab <= 4 && activeTab >= 1,
                            },
                            "fs-15 p-3"
                          )}
                          onClick={() => {
                            toggleTab(2);
                          }}
                        >
                          <i className="ri-user-2-line fs-16 p-1 align-middle me-1"></i>
                          Usuários
                        </NavLink>
                      </NavItem>
                      <NavItem role="usersBlock">
                        <NavLink
                          href="#"
                          className={classnames(
                            {
                              active: activeTab === 3,
                              done: activeTab <= 4 && activeTab > 2,
                            },
                            "fs-15 p-3"
                          )}
                          onClick={() => {
                            toggleTab(3);
                          }}
                        >
                          <i className="ri-close-circle-line fs-16 p-1 align-middle me-1"></i>
                          Bloqueados
                        </NavLink>
                      </NavItem>
                      <NavItem role="presentation">
                        <NavLink
                          href="#"
                          className={classnames(
                            {
                              active: activeTab === 4,
                              done: activeTab <= 4 && activeTab > 3,
                            },
                            "fs-15 p-3"
                          )}
                          onClick={() => {
                            toggleTab(4);
                          }}
                        >
                          <i className="ri-question-line fs-16 p-1 align-middle me-1"></i>
                          Perguntas
                        </NavLink>
                      </NavItem>
                    </Nav>
                    {/* </div> */}

                    <TabContent activeTab={activeTab}>
                      <TabPane tabId={1} id="pills-bill-info">
                        <SimpleBar
                          autoHide={false}
                          className="simplebar-track-primary"
                          style={{ maxHeight: "560px", overflow: "auto" }}
                        >
                          <ListGroup className="list-group max-height-50">
                            {messages.map((message) => (
                              <ListGroupItem key={message.id}>
                                <h5>{message.firstName}</h5>
                                <span>{message.message}</span>
                              </ListGroupItem>
                            ))}
                          </ListGroup>
                        </SimpleBar>
                        <input
                          placeholder="Digite sua mensagem"
                          value={message}
                          className="form-control mt-3"
                          onChange={(e) => setMessage(e.target.value)}
                          id="message-input"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSendMessage();
                            }
                          }}
                          autoComplete="off"
                        />
                      </TabPane>
                    </TabContent>

                    <TabContent activeTab={activeTab}>
                      <TabPane tabId={2} id="pills-bill-info">
                        <ListGroup className="list-group max-height-100">
                          {usersFromSocket.map((user) => (
                            <ListGroupItem key={user?.firstName}>
                              <h5>{user?.firstName}</h5>
                            </ListGroupItem>
                          ))}
                        </ListGroup>
                      </TabPane>
                    </TabContent>
                    <TabContent activeTab={activeTab}>
                      <TabPane tabId={3} id="pills-bill-info">
                        Bloqueados
                      </TabPane>
                    </TabContent>
                    <TabContent activeTab={activeTab}>
                      <TabPane tabId={4} id="pills-bill-info">
                        Perguntas
                      </TabPane>
                    </TabContent>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
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
      paramsSerializer: (params) => {
        return qs.stringify(params);
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
