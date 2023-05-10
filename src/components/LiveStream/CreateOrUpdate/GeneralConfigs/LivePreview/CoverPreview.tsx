import { useFormContext } from "react-hook-form";
import { CreateOrUpdateSchemaType } from "../../schema";

interface Props {
  hideInfo?: boolean;
}

export function CoverPreview({ hideInfo }: Props) {
  const { watch } = useFormContext<CreateOrUpdateSchemaType>();
  const liveCover = watch("liveCover") as FileList;
  const liveColor = watch("liveColor");
  const title = watch("title") || "Título da Live";
  const description = watch("shortDescription") || "Descrição da Live";
  const initialLiveText = watch("initialLiveText") || "NOSSA LIVE COMEÇA EM";

  const bgImage = liveCover?.[0]?.name
    ? `url(${URL.createObjectURL(liveCover[0])})`
    : "url(/svg/waiting-room-bg.svg)";

  return (
    <div
      style={{
        width: 320,
        height: 694,
        backgroundImage: bgImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: 8,
        border: "1px solid #E5E5E5",
        backgroundColor: liveColor,
      }}
    >
      {!hideInfo && (
        <div className="d-flex flex-column  align-items-center gap-2 mb-3">
          <div
            style={{
              marginTop: 80,
              width: 158,
              height: 158,
              border: "10px solid #860000",
              borderRadius: "50%",
            }}
          />

          <h4
            className="fs-4 text-center mb-0 fw-semibold text-white text-uppercase"
            style={{
              marginTop: 54,
            }}
          >
            {title}
          </h4>
          <h5
            className="fs-5 text-center fw-normal mb-0 text-white text-uppercase"
            style={{
              marginTop: 45,
            }}
          >
            {description}
          </h5>

          <p
            className="fs-5 text-center fw-normal mb-0 text-white text-uppercase"
            style={{
              marginTop: 45,
            }}
          >
            {initialLiveText}
          </p>
          <p
            className="text-center fw-bold fw-normal mb-0 text-uppercase"
            style={{
              marginTop: 0,
              fontSize: 48,
              lineHeight: "56px",
              color: "#FFB54D",
            }}
          >
            00:30:00
          </p>
        </div>
      )}
    </div>
  );
}
