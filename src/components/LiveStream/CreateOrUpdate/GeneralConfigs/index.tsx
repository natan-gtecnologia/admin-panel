import { Card } from "@/components/Common/Card";
import { Input } from "@/components/Common/Form/Input";
import { flatPickrOptions } from "@/utils/flatpick-pt";
import clsx from "clsx";
import format from "date-fns/format";
import ptBR from "date-fns/locale/pt-BR";
import Flatpickr from "react-flatpickr";
import { Controller, useFormContext } from "react-hook-form";
import Select from "react-select";
import { Button, ButtonGroup, Col, FormFeedback, Label, Row } from "reactstrap";

import { Tooltip } from "@/components/Common/Tooltip";
import type { CreateOrUpdateSchemaType } from "../schema";

export function GeneralConfigs() {
  const { register, formState, control, watch, setValue } =
    useFormContext<CreateOrUpdateSchemaType>();
  const chatReleased = watch("chatReleased");

  return (
    <Card className="shadow-none">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <h4 className="card-title mb-0 fw-bold">Configurações gerais</h4>

        <Button color="primary" className="d-flex align-items-center gap-2">
          <span className="bx bx-play fs-5" />
          Ver preview da Live
        </Button>
      </Card.Header>

      <Card.Body>
        <Row className="mb-3">
          <Col>
            <div className="form-group">
              <Label htmlFor="title">Título da Live *</Label>
              <Input
                type="text"
                className="form-control"
                id="title"
                {...register("title")}
                invalid={!!formState.errors.title}
              />
              {formState.errors.title?.message && (
                <FormFeedback type="invalid">
                  {formState.errors.title?.message}
                </FormFeedback>
              )}
            </div>
          </Col>

          <Col>
            <div className="form-group">
              <Label htmlFor="afterLiveTime">
                Tempo de compra após término da live{" "}
                <Tooltip message="Mínimo de 1 minuto">
                  <span className="bx bx-info-circle fs-6" />
                </Tooltip>
              </Label>
              <Input
                type="text"
                className="form-control"
                id="afterLiveTime"
                {...register("afterLiveTime")}
                invalid={!!formState.errors.afterLiveTime}
              />
              {formState.errors.afterLiveTime?.message && (
                <FormFeedback type="invalid">
                  {formState.errors.afterLiveTime?.message}
                </FormFeedback>
              )}
            </div>
          </Col>

          <Col>
            <div className="form-group">
              <Label htmlFor="initialDate">Data de início*</Label>
              <Controller
                control={control}
                name="scheduledStartTime"
                render={({ field }) => (
                  <Flatpickr
                    placeholder={format(new Date(), "dd/MM/Y HH:00", {
                      locale: ptBR,
                    })}
                    className={clsx("form-control", {
                      "is-invalid": !!formState.errors.scheduledStartTime,
                    })}
                    id="initialDate"
                    options={flatPickrOptions}
                    value={field.value}
                    onChange={(date) => field.onChange(date[0].toISOString())}
                  />
                )}
              />
              {!!formState.errors.scheduledStartTime && (
                <FormFeedback type="invalid">
                  {formState.errors.scheduledStartTime.message}
                </FormFeedback>
              )}
            </div>
          </Col>

          <Col
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
                  checked={chatReleased === true}
                  onChange={() => setValue("chatReleased", true)}
                />
                <Label
                  className="btn btn-secondary shadow-none mb-0"
                  htmlFor="option1"
                >
                  Sim
                </Label>

                <Input
                  type="radio"
                  className="btn-check btn-primary"
                  id="option2"
                  value="false"
                  checked={chatReleased === false}
                  onChange={() => setValue("chatReleased", false)}
                  //{...register(`chatReleased`)}
                />
                <Label
                  className="btn btn-secondary shadow-none mb-0"
                  htmlFor="option2"
                >
                  Não
                </Label>
              </ButtonGroup>
              {formState.errors?.chatReleased && (
                <FormFeedback type="invalid">
                  {formState.errors?.chatReleased.message}
                </FormFeedback>
              )}
            </div>
          </Col>

          <Col
            style={{
              maxWidth: "fit-content",
            }}
            className="d-flex align-items-end"
          >
            <Button
              type="button"
              color="primary"
              className="d-flex align-items-center gap-2"
            >
              <span className="bx bxs-pencil fs-4" /> Editar capa da live
            </Button>
          </Col>
        </Row>

        <Row>
          <Col>
            <div className="form-group">
              <Label htmlFor="shortDescription">
                Breve descrição da Live *
              </Label>
              <Input
                type="text"
                className="form-control"
                id="shortDescription"
                {...register("shortDescription")}
                invalid={!!formState.errors.shortDescription}
              />
              {formState.errors.shortDescription?.message && (
                <FormFeedback type="invalid">
                  {formState.errors.shortDescription?.message}
                </FormFeedback>
              )}
            </div>
          </Col>

          <Col>
            <div className="form-group">
              <Label htmlFor="initialLiveText">Texto de início *</Label>
              <Input
                type="text"
                className="form-control"
                id="initialLiveText"
                {...register("initialLiveText")}
                invalid={!!formState.errors.initialLiveText}
              />
              {formState.errors.initialLiveText?.message && (
                <FormFeedback type="invalid">
                  {formState.errors.initialLiveText?.message}
                </FormFeedback>
              )}
            </div>
          </Col>

          <Col>
            <div className="form-group">
              <Label className="form-label" htmlFor="company">
                Inteligências Artificiais disponíveis
              </Label>

              <Controller
                control={control}
                name="aiTags"
                render={({ field: { onChange, value, name, ref } }) => (
                  <Select
                    isSearchable
                    isClearable
                    className={clsx("basic-single", {
                      "is-invalid": !!formState.errors.aiTags,
                    })}
                    classNamePrefix="select"
                    placeholder="Selecione a categoria"
                    options={[
                      {
                        label: "Tradução simultânea",
                        value: "traducao-simultanea",
                      },
                    ]}
                    value={[
                      {
                        label: "Tradução simultânea",
                        value: "traducao-simultanea",
                      },
                    ].filter((v) => value.includes(v.value))}
                    onChange={(val: any) => {
                      if (value.includes(val?.value)) {
                        onChange(value.filter((v) => v !== val?.value));
                        return;
                      }

                      onChange(value.push(val?.value));
                    }}
                    noOptionsMessage={() => "Nenhum resultado encontrado"}
                    loadingMessage={() => "Carregando..."}
                    isMulti
                  />
                )}
              />

              {formState.errors?.aiTags && (
                <FormFeedback type="invalid">
                  {formState.errors.aiTags?.message}
                </FormFeedback>
              )}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}