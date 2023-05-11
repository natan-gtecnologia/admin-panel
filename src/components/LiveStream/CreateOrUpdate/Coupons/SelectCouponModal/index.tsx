import { ICoupon } from "@/@types/coupon";
import { Input } from "@/components/Common/Form/Input";
import TableContainer from "@/components/Common/TableContainer";
import { api } from "@/services/apiClient";
import { convert_coupon_strapi } from "@/utils/convertions/convert_coupon";
import { formatNumberToReal } from "@growthventure/utils/lib/formatting/format";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import {
  cloneElement,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useFormContext } from "react-hook-form";
import type { CellProps } from "react-table";
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
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { watch, setValue } = useFormContext<CreateOrUpdateSchemaType>();
  const coupons = watch("coupons");
  const { data: couponsFromApi } = useQuery({
    queryKey: ["coupons", "notIn", coupons],
    queryFn: async () => {
      try {
        const response = await api.get("/coupons", {
          params: {
            filters: {
              id: {
                $notIn: coupons,
              },
            },
            pagination: {
              pageSize: 100,
            },
          },
        });

        return (response.data?.data?.map(convert_coupon_strapi) ??
          []) as ICoupon[];
      } catch (error) {
        return [] as ICoupon[];
      }
    },
    initialData: [] as ICoupon[],
    refetchOnWindowFocus: false,
  });

  const filteredCoupons = useMemo(() => {
    return couponsFromApi?.filter((coupon) =>
      coupon.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, couponsFromApi]);

  const handleInsert = useCallback(() => {
    const selectedCoupons = selectedIds.filter(
      (coupon) => !coupons.includes(coupon)
    );
    setValue("coupons", [...coupons, ...selectedCoupons]);
    setSelectedIds([]);
    setIsOpen(false);
  }, [coupons, selectedIds, setValue]);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const toggleSelectedId = useCallback(
    (id: number) => {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
      } else {
        const newSelectedIds = [...selectedIds, id];
        setSelectedIds(newSelectedIds);
      }
    },
    [selectedIds]
  );

  const columns = useMemo(
    () => [
      {
        Header: (
          <div className="form-check d-flex justify-content-center flex-1 align-items-center">
            <Input
              className="form-check-input"
              type="checkbox"
              checked={selectedIds.length === filteredCoupons.length}
              onChange={() => {
                if (selectedIds.length === filteredCoupons.length) {
                  setSelectedIds([]);
                } else {
                  setSelectedIds(filteredCoupons.map((product) => product.id));
                }
              }}
            />
          </div>
        ),
        Cell: (cellProps: CellProps<ICoupon>) => {
          return (
            <div className="form-check d-flex justify-content-center">
              <Input
                className="form-check-input"
                type="checkbox"
                checked={selectedIds.includes(cellProps.row.original.id)}
                onChange={() => {
                  toggleSelectedId(cellProps.row.original.id);
                }}
              />
            </div>
          );
        },
        id: "#",
        width: "8%",
      },
      {
        Header: "Nome do cupom",
        Cell: (cellProps: CellProps<ICoupon>) => {
          return cellProps.row.original.description;
        },
        id: "#name",
      },
      {
        Header: "Código do Cupom",
        Cell: (cellProps: CellProps<ICoupon>) => {
          return cellProps.row.original.code;
        },
        id: "#code",
      },
      {
        Header: "Desconto",
        Cell: (cellProps: CellProps<ICoupon>) => {
          return cellProps.row.original.discountType === "percentage" ? (
            <span>{cellProps.row.original.discount}%</span>
          ) : (
            <span>{formatNumberToReal(cellProps.row.original.discount)}</span>
          );
        },
        id: "#discount",
        width: "15%",
      },
    ],
    [filteredCoupons, selectedIds, toggleSelectedId]
  );

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
          <Card.Body className="pt-0 pb-0">
            <div className="form-icon position-relative mb-3">
              <Input
                className="form-control form-control-icon"
                placeholder="Digite aqui para pesquisar o produto"
                value={search}
                onChange={(e: any) => {
                  setSearch(e.target.value);
                }}
                style={{
                  paddingRight: "3rem",
                }}
              />
              <i className="mdi mdi-magnify" />

              <span
                className={clsx(
                  "mdi mdi-close-circle position-absolute search-widget-icon-close"
                )}
                style={{
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  opacity: search ? 1 : 0,
                  right: search ? "1rem" : "0.5rem",
                  pointerEvents: search ? "all" : "none",
                }}
                role="button"
                tabIndex={0}
                aria-label="Limpar pesquisa"
                onClick={() => {
                  setSearch("");
                }}
                id="search-close-options"
              />
            </div>

            <TableContainer
              columns={columns}
              data={filteredCoupons}
              customPageSize={10}
              divClass="table-responsive mb-1"
              tableClass="mb-0 align-middle table-borderless"
              theadClass="table-light text-muted"
              hidePagination
            />
          </Card.Body>

          <Card.Footer className="d-flex align-items-center gap-2 justify-content-end border-0">
            <Button
              onClick={toggle}
              color="light"
              className="shadow-none"
              type="button"
            >
              Cancelar
            </Button>
            <Button
              className="shadow-none"
              type="button"
              onClick={handleInsert}
            >
              Adicionar
            </Button>
          </Card.Footer>
        </Card>
      </Modal>
    </>
  );
}
