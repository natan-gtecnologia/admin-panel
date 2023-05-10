import { api } from "@/services/apiClient";
import { ICoupon } from "@growthventure/utils";
import { useQuery } from "@tanstack/react-query";
import { cloneElement, useState, type ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { Button, Modal } from "reactstrap";
import { Card } from "../../../../Common/Card";
import { CreateOrUpdateSchemaType } from "../../schema";

type ChildrenModalProps = {
  toggle: () => void;
};

type GoBackModalProps = {
  children: ReactNode | ((props: ChildrenModalProps) => ReactNode);
};

export function SelectCouponModal({ children }: GoBackModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { watch } = useFormContext<CreateOrUpdateSchemaType>();
  const coupons = watch("coupons");
  const {} = useQuery({
    queryKey: ["coupons", "nin", coupons],
    queryFn: async () => {
      try {
        const response = api.get("/coupons", {
          params: {
            filters: {
              id: {
                $nin: coupons,
              },
            },
            pagination: {
              pageSize: 100,
            },
          },
        });

        return [] as ICoupon[];
      } catch (error) {
        return [] as ICoupon[];
      }
    },
    initialData: [] as ICoupon[],
  });

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {typeof children !== "function"
        ? cloneElement(children as React.ReactElement, { onClick: toggle })
        : children({
            toggle,
          })}
      <Modal isOpen={isOpen} centered toggle={toggle}>
        <Card className="m-0 shadow-none">
          <Card.Header className="d-flex align-items-center gap-1 justify-content-between border-0">
            <h4 className="m-0 fs-5 fw-bold">Adicionar cupom</h4>
            <Button onClick={toggle} close />
          </Card.Header>
          <Card.Body className="pt-0 pb-0"></Card.Body>

          <Card.Footer className="d-flex align-items-center gap-2 justify-content-end border-0">
            <Button
              onClick={toggle}
              color="light"
              className="shadow-none"
              type="button"
            >
              Cancelar
            </Button>
            <Button className="shadow-none" type="button">
              Adicionar
            </Button>
          </Card.Footer>
        </Card>
      </Modal>
    </>
  );
}
