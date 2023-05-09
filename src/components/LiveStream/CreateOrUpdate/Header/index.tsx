import { Card } from "@/components/Common/Card";
import Link from "next/link";
import { useFormContext } from "react-hook-form";
import { Button } from "reactstrap";
import { CreateOrUpdateSchemaType } from "../schema";

export function Header() {
  const { watch } = useFormContext<CreateOrUpdateSchemaType>();
  const title = watch("title");

  return (
    <Card className="shadow-none rounded-sm">
      <Card.Body className="d-flex align-items-center">
        <h2 className="flex-1 fs-5 fw-bold m-0">{title || "Título da Live"}</h2>

        <div className="d-flex align-items-center gap-2">
          <Link href="/live-stream">
            <Button
              color="danger"
              outline
              type="button"
              className="d-flex align-items-center gap-2"
            >
              <span className="bx bx-x fs-4" />
              Cancelar
            </Button>
          </Link>

          <Button
            color="primary"
            disabled
            outline
            type="button"
            className="d-flex align-items-center gap-2"
          >
            <span className="bx bxs-save fs-4" />
            Salvar
          </Button>

          <Button
            color="primary"
            type="button"
            className="d-flex align-items-center gap-2"
          >
            <span className="bx bx-play fs-4" />
            Live teste
          </Button>

          <Button
            color="success"
            type="button"
            className="d-flex align-items-center gap-2"
          >
            <span className="bx bx-play fs-4" />
            Iniciar live
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
