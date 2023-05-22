import { ConfirmationModal } from "@/components/ConfirmationModal";
import classnames from 'classnames';
import { useEffect, useRef, useState } from "react";
import { Col, ListGroup, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import SimpleBar from "simplebar-react";

export interface usersFromSocketProps {
    firstName: string
    chat_id: number
    chat: Chat
}

export interface Chat {
    id: number
    joinedAt: string
    blocked: boolean
    blockedAt: string
    isOnline: boolean
    chat_user: ChatUser
}

export interface ChatUser {
    id: number
    firstName: string
    lastName: string
    email: string
    socketId: string
    createdAt: string
    updatedAt: string
    role: any
}

export function LiveTabs({ messages, message, setMessage, handleSendMessage, usersFromSocket, handleBlockUser }: any) {
    const [activeTab, setActiveTab] = useState(1);
    const [passedSteps, setPassedSteps] = useState([1]);
    const [listUsers, setListUsers] = useState<Array<usersFromSocketProps>>([usersFromSocket]);
    const messagesScrollbarRef = useRef<SimpleBar | null>(null)

    async function toggleTab(tab: number): Promise<void> {
        if (activeTab !== tab) {
            const modifiedSteps = [...passedSteps, tab];

            if (tab >= 1 && tab <= 5) {
                setActiveTab(tab);
                setPassedSteps(modifiedSteps);
            }
        }
    }

    useEffect(() => {
        const usersListNotBlock = usersFromSocket.filter((user: usersFromSocketProps) => user?.chat?.blocked !== true)

        setListUsers(usersListNotBlock)
    }, [usersFromSocket])

    useEffect(() => {
        if (messagesScrollbarRef.current) {
            messagesScrollbarRef.current.getScrollElement().scrollTop = messagesScrollbarRef.current.getScrollElement().scrollHeight
        }
    }, [messages.length])


    return (
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
                        <i className="bx bx-block fs-16 p-1 align-middle me-1"></i>
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
                        ref={messagesScrollbarRef}
                    >
                        <ListGroup className="list-group max-height-50">
                            {messages.map((message: any) => (
                                <div className="d-flex align-items-center w-100 border-bottom py-3" key={message.id}>
                                    <div>
                                        <h5>{message.firstName}</h5>
                                        <span>{message.message}</span>
                                    </div>
                                </div>
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
                      {usersFromSocket.map((user: any) => (
                          <div className="d-flex align-items-center w-100 justify-content-between border-bottom py-3" key={user.firstName}>
                              <div>
                                  <h5>{user.firstName}</h5>
                              </div>
                              <div>
                                  <ConfirmationModal
                                      changeStatus={() => handleBlockUser(user)}
                                      title="Bloquear usuário"
                                      message="Tem certeza que deseja bloquear esse usuário?"
                                  >
                                      <button
                                          type="button"
                                          className="btn"
                                      >
                                          <i className="bx bx-block align-bottom"></i>
                                      </button>
                                  </ConfirmationModal>
                              </div>
                          </div>
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
    )
}