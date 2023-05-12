import { Card } from "@/components/Common/Card";
import { Input } from "@/components/Common/Form/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, cloneElement, useCallback, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button, ButtonGroup, Label, Modal } from "reactstrap";
import { z } from "zod";

type ChildrenModalProps = {
  toggle: () => void;
};

interface Props {
  regularPrice: number;
  price: number;
  children: ReactNode | ((props: ChildrenModalProps) => ReactNode);
  onChange: (newPrice: number) => void;
}

const discountSchema = z.object({
  type: z.enum(["percentage", "value"]),
  value: z.number().min(0, "O valor deve ser maior ou igual a 0"),
});

type DiscountSchema = z.infer<typeof discountSchema>;

export function ChangeDiscountModal({
  children,
  regularPrice,
  price,
  onChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, formState, watch, setValue, reset } =
    useForm<DiscountSchema>({
      resolver: zodResolver(discountSchema),
      defaultValues: {
        type: "value",
        value: regularPrice - price,
      },
    });
  const type = watch("type");
  const discount = watch("value");

  const toggle = useCallback(() => {
    reset();
    setIsOpen(!isOpen);
  }, [isOpen, reset]);

  const handleUpdateOnSubmit = useCallback<SubmitHandler<DiscountSchema>>(
    async (data) => {
      if (data.type === "value") {
        onChange(regularPrice - data.value);
      } else if (data.type === "percentage") {
        onChange(regularPrice - regularPrice * (data.value / 100));
      }

      toggle();
    },
    [onChange, regularPrice, toggle]
  );

  return (
    <>
      {typeof children !== "function"
        ? cloneElement(children as React.ReactElement, { onClick: toggle })
        : children({
            toggle,
          })}
      <Modal isOpen={isOpen} centered toggle={() => toggle()}>
        <Card className="m-0 shadow-none">
          <Card.Header className="d-flex align-items-center gap-1 justify-content-between border-0">
            <h4 className="m-0 fs-5 fw-bold">Atualizar desconto</h4>
            <Button onClick={() => toggle()} close />
          </Card.Header>
          <Card.Body className="pt-0 pb-0">
            <p className="m-0">
              O desconto pode ser inserido de forma monetária ou percentual,
              sendo exclusivo apenas para a live. O valor será calculado
              automaticamente e aplicado ao total.{" "}
            </p>

            <div>
              <div className="form-group mb-3">
                <Label className="d-block">Ativar chat</Label>
                <ButtonGroup
                  style={{
                    width: "100%",
                  }}
                >
                  <Input
                    type="radio"
                    className="btn-check btn-primary"
                    id="discount:value"
                    value="value"
                    {...register("type", {
                      onChange: (e) => {
                        if (e.target.value === "value") {
                          const discountPercentageNumber = Number(discount);

                          setValue(
                            "value",
                            regularPrice * (discountPercentageNumber / 100)
                          );
                        } else if (e.target.value === "percentage") {
                          const discountValueNumber = Number(discount);

                          setValue(
                            "value",
                            (discountValueNumber / regularPrice) * 100
                          );
                        }
                      },
                    })}
                  />
                  <Label
                    className="btn btn-secondary shadow-none mb-0"
                    style={{
                      borderTopLeftRadius: 4,
                      borderBottomLeftRadius: 4,
                    }}
                    htmlFor="discount:value"
                  >
                    Valor
                  </Label>

                  <Input
                    type="radio"
                    className="btn-check btn-primary"
                    id="discount:percentage"
                    value="percentage"
                    {...register("type")}
                    //{...register(`chatReleased`)}
                  />
                  <Label
                    className="btn btn-secondary shadow-none mb-0"
                    style={{
                      borderTopRightRadius: 4,
                      borderBottomRightRadius: 4,
                    }}
                    htmlFor="discount:percentage"
                  >
                    Percentual
                  </Label>
                </ButtonGroup>
              </div>

              <div className="form-group">
                <Label htmlFor="discount_value">Valor do desconto</Label>
                <Input
                  type="text"
                  className="form-control"
                  id="discount_value"
                  placeholder="R$ 20"
                  prefix={type === "value" ? "R$" : undefined}
                  suffix={type === "percentage" ? "%" : undefined}
                  {...register("value", {
                    valueAsNumber: true,
                  })}
                  error={formState.errors.value?.message}
                  onKeyUp={(e: any) => {
                    if (e.key === "Enter") {
                      handleSubmit(handleUpdateOnSubmit)();
                    }
                  }}
                />
              </div>
            </div>
          </Card.Body>

          <Card.Footer className="d-flex align-items-center gap-2 justify-content-end border-0">
            <Button
              onClick={() => {
                toggle();
                reset();
              }}
              color="light"
              className="shadow-none"
              type="button"
            >
              Cancelar
            </Button>
            <Button
              color="primary"
              className="shadow-none"
              onClick={handleSubmit(handleUpdateOnSubmit)}
              type="button"
            >
              Atualizar
            </Button>
          </Card.Footer>
        </Card>
      </Modal>
    </>
  );
}
