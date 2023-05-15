import { ILiveStream } from "@/@types/livestream";
import { Card } from "@/components/Common/Card";
import { Input } from "@/components/Common/Form/Input";
import { Tooltip } from "@/components/Common/Tooltip";
import { api } from '@/services/apiClient';
import { queryClient } from '@/services/react-query';
import { useMutation } from '@tanstack/react-query';
import clsx from "clsx";
import debounce from 'lodash/debounce';
import { useCallback, type ChangeEvent } from 'react';
import { ButtonGroup, Col, Label, Row } from "reactstrap";

interface GeneralConfigProps {
    liveId: number;
    chat: {
        id: number;
        active: boolean;
    }
    timeout: number;
}

export function GenerealConfigs({ liveId, chat, timeout }: GeneralConfigProps) {
    const {
        mutateAsync: handleUpdateChatStatus,
        isLoading: isUpdatingChatStatus
    } = useMutation({
        mutationFn: async () => {
            try {
                if (chat.id === 0) return;

                await api.put(`/chats/${chat.id}`, {
                    data: {
                        active: !chat.active
                    }
                });

                queryClient.setQueryData<ILiveStream | undefined>(
                    ["liveStream", 'room', liveId], (oldData) => {
                        if (!oldData)
                            return;

                        return {
                            ...oldData,
                            chat: {
                                ...oldData.chat,
                                active: !oldData.chat.active
                            }
                        };
                    }
                )
            } catch { }
        }
    })

    const {
        mutateAsync: handleUpdateTimeout,
        isLoading: isTimeoutUpdating
    } = useMutation<
        void,
        void,
        { timeout: number }
    >({
        mutationFn: async ({ timeout }) => {
            try {
                await api.put(`/live-streams/${liveId}`, {
                    data: {
                        timeout
                    }
                });

                queryClient.setQueryData<ILiveStream | undefined>(
                    ["liveStream", 'room', liveId], (oldData) => {
                        if (!oldData)
                            return;

                        return {
                            ...oldData,
                            timeout
                        };
                    }
                )
            } catch { }
        }
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const timeoutDebounce = useCallback(debounce(
        (timeout: number) => handleUpdateTimeout({ timeout })
        , 500), [])

    return (
        <Card>
            <Card.Header>
                <h6 className="card-title mb-0 flex-grow-1">
                    Configurações Gerais
                </h6>
            </Card.Header>
            <Card.Body>
                <Row>
                    <Col
                        md={4}
                        style={{
                            maxWidth: "fit-content",
                        }}
                    >
                        <div className="form-group">
                            <Label className="d-block">Ativar chat</Label>
                            <ButtonGroup>
                                <Input
                                    type="radio"
                                    className="btn-check btn-primary"
                                    id="option1"
                                    value="true"
                                    checked={chat.active}
                                    onChange={() => {
                                        if (chat.active) return;
                                        handleUpdateChatStatus()
                                    }}
                                    disabled={isUpdatingChatStatus}
                                />
                                <Label
                                    className={clsx("btn shadow-none mb-0", {
                                        "btn-outline-primary": !chat.active,
                                        "btn-primary": chat.active,
                                    })}
                                    htmlFor="option1"
                                >
                                    Sim
                                </Label>

                                <Input
                                    type="radio"
                                    className="btn-check btn-primary"
                                    id="option2"
                                    value="false"
                                    checked={!chat.active}
                                    disabled={isUpdatingChatStatus}
                                    onChange={() => {
                                        if (!chat.active) return;
                                        handleUpdateChatStatus()
                                    }}
                                />
                                <Label
                                    className={clsx("btn shadow-none mb-0", {
                                        "btn-outline-primary": chat.active,
                                        "btn-primary": !chat.active,
                                    })}
                                    htmlFor="option2"
                                >
                                    Não
                                </Label>
                            </ButtonGroup>
                        </div>
                    </Col>

                    <Col md={10}>
                        <div className="form-group">
                            <Label htmlFor="afterLiveTime">
                                Tempo de compra após término da live{" "}
                                <Tooltip message="Mínimo de 1 minuto">
                                    <span className="bx bx-info-circle fs-6" />
                                </Tooltip>
                            </Label>
                            <Input
                                type="number"
                                min={1}
                                step={1}
                                className="form-control"
                                id="afterLiveTime"
                                placeholder="0 minutos"
                                defaultValue={timeout}
                                onChange={
                                    (e: ChangeEvent<HTMLInputElement>) => timeoutDebounce(
                                        Number(e.target.value)
                                    )
                                }
                                disabled={isTimeoutUpdating}
                            />
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    )
}