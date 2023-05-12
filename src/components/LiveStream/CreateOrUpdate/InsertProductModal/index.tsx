import { Card } from "@/components/Common/Card";
import TableContainer from "@/components/Common/TableContainer";
import { api } from "@/services/apiClient";
import { currentPrice } from "@/utils/price";
import type { IProduct } from "@growthventure/utils";
import { convert_product_strapi } from "@growthventure/utils/lib/formatting/convertions/convert_product";
import { formatNumberToReal } from "@growthventure/utils/lib/formatting/format";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import Image from "next/image";
import QueryString from "qs";
import {
  cloneElement,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CellProps } from "react-table";
import { Button, Input, Modal } from "reactstrap";

type ChildrenModalProps = {
  toggle: () => void;
};

interface Props {
  children: ReactNode | ((props: ChildrenModalProps) => ReactNode);
  products?: IProduct[];
  highlightedCount?: number;

  onSelect: (ids: number[], products?: IProduct[]) => void;
}

export function InsertProductModal({
  children,
  products,
  highlightedCount = 0,

  onSelect
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: productsData } = useQuery({
    queryKey: ["products", search],
    queryFn: async () => {
      try {
        const response = await api.get("/products", {
          params: {
            filters: {
              title: {
                $contains: search,
              },
            },
            pagination: {
              pageSize: 100,
            },
          },
          paramsSerializer: {
            serialize: (params) => QueryString.stringify(params),
          },
        });

        return response.data.data?.map(convert_product_strapi) as IProduct[];
      } catch (error) {
        console.log(error);
        return [] as IProduct[];
      }
    },
    enabled: !products && isOpen,
    initialData: [],
    refetchOnWindowFocus: false,
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const productsMerged = products ?? productsData;

  const handleAddToList = useCallback(() => {
    onSelect(selectedIds, productsMerged);

    setSelectedIds([]);
    setIsOpen(false);
  }, [productsMerged, selectedIds, onSelect]);

  const productsFiltered = productsMerged.filter((product) => {
    return product.title.toLowerCase().includes(search.toLowerCase());
  });

  const toggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const toggleSelectedId = useCallback(
    (id: number) => {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
      } else {
        if (highlightedCount === 4) return;

        const newSelectedIds = [...selectedIds, id];
        setSelectedIds(newSelectedIds);
      }
    },
    [highlightedCount, selectedIds]
  );

  const columns = useMemo(
    () => [
      {
        Header: (
          <div className="form-check d-flex justify-content-center flex-1 align-items-center">
            <Input
              className="form-check-input"
              type="checkbox"
              checked={selectedIds.length === productsFiltered.length}
              onChange={() => {
                if (
                  !products &&
                  selectedIds.length === productsFiltered.length
                ) {
                  setSelectedIds([]);
                } else if (!products) {
                  setSelectedIds(productsFiltered.map((product) => product.id));
                }
              }}
            />
          </div>
        ),
        Cell: (cellProps: CellProps<IProduct>) => {
          return (
            <div className="form-check d-flex justify-content-center">
              <Input
                className="form-check-input"
                type="checkbox"
                disabled={highlightedCount === 4}
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
        Header: "Foto",
        Cell: (cellProps: CellProps<IProduct>) => {
          return (
            <div className="form-check form-switch">
              <Image
                src={cellProps.row.original.product_image.src}
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
    [
      highlightedCount,
      products,
      productsFiltered,
      selectedIds,
      toggleSelectedId,
    ]
  );

  return (

    <>
      {
        typeof children !== "function"
          ? cloneElement(children as React.ReactElement, { onClick: toggle })
          : children({
            toggle,
          })
      }
      <Modal isOpen={isOpen} centered toggle={toggle}>
        <Card className="m-0 shadow-none">
          <Card.Header className="d-flex align-items-center gap-1 justify-content-between border-0">
            <h4 className="m-0 fs-5 fw-bold">Adicionar produto</h4>
            <Button
              onClick={() => {
                toggle();
              }}
              close
            />
          </Card.Header>
          <Card.Body className="pt-0 pb-0">
            <div className="form-icon position-relative mb-3">
              <Input
                type="email"
                className="form-control form-control-icon"
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
              hidePagination
            />
          </Card.Body>

          <Card.Footer className="d-flex align-items-center gap-2 justify-content-end border-0">
            <Button
              onClick={() => {
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
              onClick={handleAddToList}
              disabled={highlightedCount === 4}
            >
              Adicionar
            </Button>
          </Card.Footer>
        </Card>
      </Modal>
    </>
  );
}
