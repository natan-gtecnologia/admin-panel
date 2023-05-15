import { IBroadcaster } from "@/@types/broadcasters";
import { Input } from "@/components/Common/Form/Input";
import TableContainer from "@/components/Common/TableContainer";
import { api } from "@/services/apiClient";
import { convert_broadcasters_strapi } from "@/utils/convertions/convert_broadcasters";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import {
  cloneElement,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CellProps } from "react-table";
import { Button, Modal, Spinner } from "reactstrap";
import { Card } from "../../../../Common/Card";

type ChildrenModalProps = {
  toggle: () => void;
};

type GoBackModalProps = {
  children: ReactNode | ((props: ChildrenModalProps) => ReactNode);

  onSelect: (ids: number[]) => void | Promise<void>;
  broadcasters: number[];
};

export function SelectBroadcasterModal({ children, broadcasters, onSelect }: GoBackModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isAddingToList, setIsAddingToList] = useState(false);
  const { data: broadcastersFromApi } = useQuery({
    queryKey: ["broadcasters", "notIn", broadcasters],
    queryFn: async () => {
      try {
        const response = await api.get("/broadcasters", {
          params: {
            populate: '*',
            filters: {
              id: {
                $notIn: broadcasters,
              },
            },
            pagination: {
              pageSize: 100,
            },
          },
        });

        return (response.data?.data?.map(convert_broadcasters_strapi) ??
          []) as IBroadcaster[];
      } catch (error) {
        return [] as IBroadcaster[];
      }
    },
    initialData: [] as IBroadcaster[],
    refetchOnWindowFocus: false,
  });

  const filteredBroadcaster = useMemo(() => {
    return broadcastersFromApi?.filter((broadcaster) =>
      broadcaster?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, broadcastersFromApi]);

  const handleInsert = useCallback(async () => {
    try {
      setIsAddingToList(true);
      const selectedCoupons = selectedIds.filter(
        (coupon) => !broadcasters.includes(coupon)
      );
      await onSelect([...broadcasters, ...selectedCoupons])
      setSelectedIds([]);
      setIsOpen(false);
    } catch { } finally {
      setIsAddingToList(false);
    }
  }, [broadcasters, onSelect, selectedIds]);

  const toggle = () => {
    if (isAddingToList) return;
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
              checked={selectedIds.length === filteredBroadcaster.length}
              onChange={() => {
                if (selectedIds.length === filteredBroadcaster.length) {
                  setSelectedIds([]);
                } else {
                  setSelectedIds(filteredBroadcaster.map((product) => product.id));
                }
              }}
            />
          </div>
        ),
        Cell: (cellProps: CellProps<IBroadcaster>) => {
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
        Header: "Nome da apresentadora",
        Cell: (cellProps: CellProps<IBroadcaster>) => {
          return cellProps.row.original.name;
        },
        id: "#name",
      },
      {
        Header: "E-mail da apresentadora",
        Cell: (cellProps: CellProps<IBroadcaster>) => {
          return cellProps.row.original.email;
        },
        id: "#email",
      },
    ],
    [filteredBroadcaster, selectedIds, toggleSelectedId]
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
            <h4 className="m-0 fs-5 fw-bold">Adicionar apresentadora</h4>
            <Button onClick={toggle} close />
          </Card.Header>
          <Card.Body className="pt-0 pb-0">
            <div className="form-icon position-relative mb-3">
              <Input
                className="form-control form-control-icon"
                placeholder="Digite aqui para pesquisar"
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
              data={filteredBroadcaster}
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
              {isAddingToList ? (
                <span className="d-flex align-items-center">
                  <Spinner size="sm" className="flex-shrink-0" role="status">
                    Adicionando...
                  </Spinner>
                  <span className="flex-grow-1 ms-2">Adicionando...</span>
                </span>
              ) : 'Adicionar'}
            </Button>
          </Card.Footer>
        </Card>
      </Modal>
    </>
  );
}
