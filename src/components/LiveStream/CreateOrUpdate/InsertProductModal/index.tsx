import type { IProduct } from "@/@types/product";
import { Card } from "@/components/Common/Card";
import TableContainer from "@/components/Common/TableContainer";
import { currentPrice } from "@/utils/price";
import { formatNumberToReal } from "@growthventure/utils/lib/formatting/format";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import Image from "next/image";
import {
  cloneElement,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useFormContext } from "react-hook-form";
import type { CellProps } from "react-table";
import { Button, Input, Modal } from "reactstrap";
import type { CreateOrUpdateSchemaType } from "../schema";

type ChildrenModalProps = {
  toggle: () => void;
};

interface Props {
  children: ReactNode | ((props: ChildrenModalProps) => ReactNode);
  products?: IProduct[];
}

export function InsertProductModal({ children, products }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { register, setValue, formState, watch } =
    useFormContext<CreateOrUpdateSchemaType>();
  const [search, setSearch] = useState("");
  const { data: productsData } = useQuery({
    queryKey: ["products", search],
    queryFn: async () => {
      return [] as IProduct[];
    },
    enabled: !products,
    initialData: [],
  });
  const [selectedIds, setSelectedIds] = useState<number[] | "all">([]);

  const productsMerged = useMemo(() => {
    return [...productsData, ...(products ?? [])];
  }, [products, productsData]);

  const productsFiltered = productsMerged.filter((product) => {
    return product.title.toLowerCase().includes(search.toLowerCase());
  });

  const toggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const toggleSelectedId = useCallback(
    (id: number) => {
      if (selectedIds === "all") {
        setSelectedIds(
          productsMerged
            .filter((coupon) => coupon.id !== id)
            .map((coupon) => coupon.id)
        );
      } else if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
      } else {
        const newSelectedIds = [...selectedIds, id];
        setSelectedIds(
          newSelectedIds.length === productsMerged.length
            ? "all"
            : newSelectedIds
        );
      }
    },
    [productsMerged, selectedIds]
  );

  const columns = useMemo(
    () => [
      {
        Header: (
          <div className="form-check form-switch d-flex justify-content-center flex-1 align-items-center">
            <Input
              className="form-check-input"
              type="checkbox"
              id="SwitchCheck1"
              checked={selectedIds === "all"}
              onChange={() => {
                if (selectedIds === "all") {
                  setSelectedIds([]);
                } else {
                  setSelectedIds("all");
                }
              }}
            />
          </div>
        ),
        Cell: (cellProps: CellProps<IProduct>) => {
          return (
            <div className="form-check form-switch d-flex justify-content-center">
              <Input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="SwitchCheck1"
                checked={
                  selectedIds === "all" ||
                  selectedIds.includes(cellProps.row.original.id)
                }
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
        Header: "Foto",
        Cell: (cellProps: CellProps<IProduct>) => {
          return (
            <div className="form-check form-switch">
              {cellProps.row.original.images.data &&
                cellProps.row.original.images.data.length > 0 && (
                  <Image
                    src={
                      cellProps.row.original.images.data[0].attributes.formats
                        .thumbnail.url
                    }
                    alt=""
                    width={32}
                    height={32}
                    loading="lazy"
                    style={{
                      borderRadius: 4,
                      objectFit: "cover",
                      objectPosition: "center",
                    }}
                  />
                )}
            </div>
          );
        },
        id: "#picture",
        width: "25%",
      },
      {
        Header: "Nome do Produto",
        Cell: (cellProps: CellProps<IProduct>) => {
          return cellProps.row.original.title;
        },
        id: "#name",
      },
      {
        Header: "Preço Original",
        Cell: (cellProps: CellProps<IProduct>) => {
          const price = currentPrice({
            regular_price: cellProps.row.original.price.regularPrice,
            price:
              cellProps.row.original.price?.salePrice ??
              cellProps.row.original.price.regularPrice,
          });
          return formatNumberToReal(price.price);
        },
        id: "#price",
        width: "25%",
      },
    ],
    [selectedIds, toggleSelectedId]
  );

  return (
    <>
      {typeof children !== "function"
        ? cloneElement(children as React.ReactElement, { onClick: toggle })
        : children({
            toggle,
          })}
      <Modal isOpen={isOpen} centered>
        <Card className="m-0 shadow-none">
          <Card.Header className="d-flex align-items-center gap-1 justify-content-between border-0">
            <h4 className="m-0 fs-5 fw-bold">Adicionar produto</h4>
            <Button
              onClick={() => {
                setValue("liveCover", null);
                setValue("liveColor", "#DB7D72");
                toggle();
              }}
              close
            />
          </Card.Header>
          <Card.Body className="pt-0 pb-0">
            <div className="form-icon position-relative">
              <Input
                type="email"
                className="form-control form-control-icon"
                id="iconInput"
                placeholder="Digite aqui para pesquisar o produto"
                value={search}
                onChange={(e) => {
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
              data={productsFiltered}
              customPageSize={10}
              divClass="table-responsive mb-1"
              tableClass="mb-0 align-middle table-borderless"
              theadClass="table-light text-muted"
            />
          </Card.Body>

          <Card.Footer className="d-flex align-items-center gap-2 justify-content-end border-0">
            <Button
              onClick={() => {
                setValue("liveCover", null);
                setValue("liveColor", "#DB7D72");
                toggle();
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
              type="button"
              onClick={() => {
                toggle();
              }}
            >
              Adicionar
            </Button>
          </Card.Footer>
        </Card>
      </Modal>
    </>
  );
}
