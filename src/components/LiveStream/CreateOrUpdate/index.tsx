import { api } from "@/services/apiClient";
import { zodResolver } from "@hookform/resolvers/zod";
import Router from "next/router";
import { useCallback } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Broadcasters } from "./Broadcasters";
import { Coupons } from "./Coupons";
import { GeneralConfigs } from "./GeneralConfigs";
import { Header } from "./Header";
import { HighlightedProducts } from "./HighlightedProducts";
import { Products } from "./Products";
import { CreateOrUpdateSchemaType, createOrUpdateSchema } from "./schema";

type Props = {
  data?: CreateOrUpdateSchemaType & {
    bannerId: number | null;
  };
  broadcasters?: {
    broadcaster_id: number;
    id: number;
  }[];
};

const DEFAULT: CreateOrUpdateSchemaType = {
  title: "",
  afterLiveTime: 1,
  aiTags: [],
  broadcasters: [],
  chatReleased: false,
  coupons: [],
  initialLiveText: "",
  products: [],
  liveCover: null,
  liveColor: "#DB7D72",
  scheduledStartTime: new Date(),
  shortDescription: "",
};

function getFormattedBroadcasters(
  broadcasters: CreateOrUpdateSchemaType["broadcasters"],
  broadcastersData: NonNullable<Props["broadcasters"]>
) {
  return broadcasters.map((broadcaster) => {
    const broadcasterData = broadcastersData.find(
      (broadcasterData) => broadcasterData.broadcaster_id === broadcaster
    );

    return {
      broadcaster: broadcaster,
      ...(broadcasterData?.id && { id: broadcasterData?.id }),
    };
  });
}

export function CreateOrUpdate({ data, broadcasters = [] }: Props) {
  const formProps = useForm<CreateOrUpdateSchemaType>({
    resolver: zodResolver(createOrUpdateSchema),
    defaultValues: data || DEFAULT,
  });
  const { handleSubmit } = formProps;

  const onCreateOrUpdate = useCallback<SubmitHandler<CreateOrUpdateSchemaType>>(
    async (values) => {
      const id = toast.loading("Salvando live...", {
        autoClose: 3000,
      });

      try {
        let imageId: null | number = null;

        if (values.liveCover) {
          const uploadFormData = new FormData();
          values.liveCover.forEach((file: File) => {
            uploadFormData.append("files", file);
          });

          const response = await api.post("/upload", uploadFormData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          imageId = response.data[0].id;
        }

        const formData = {
          title: values.title,
          streamProducts: values.products.map((product) => ({
            product: product.id,
            price: {
              regularPrice: product.livePrice,
              salePrice: product.livePrice,
            },
            highlight: product.highlighted,
          })),
          coupons: values?.coupons,
          startText: values.initialLiveText,
          timeout: values.afterLiveTime,
          backgroundColorIfNotHaveBanner: values.liveColor,
          schedule: values.scheduledStartTime,
          liveDescription: values.shortDescription,
          bannerLive: imageId,
          broadcasters:
            broadcasters.length > 0
              ? getFormattedBroadcasters(values.broadcasters, broadcasters)
              : values.broadcasters.map((broadcaster) => ({
                broadcaster: broadcaster,
              })),
        };

        if (data && data.id) {
          if (!values.liveCover) {
            formData.bannerLive = data.bannerId;
          }

          delete values.id;

          await api.put(`/live-streams/${data.id}`, {
            data: formData,
          });

          toast.update(id, {
            render: "Live atualizada com sucesso",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          return;
        }

        const response = await api.post("/live-streams", {
          data: formData,
        });

        await Router.push(`/live-stream/editar/${response.data.data.id}`);

        toast.update(id, {
          render: "Live salva com sucesso",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } catch (error) {
        toast.update(id, {
          render: "Erro ao salvar live",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    },
    [broadcasters, data]
  );

  return (
    <FormProvider {...formProps}>
      <form onSubmit={handleSubmit(onCreateOrUpdate)}>
        <Header />

        <GeneralConfigs />

        <Products />

        <HighlightedProducts />

        <Coupons />

        <Broadcasters />
      </form>
    </FormProvider>
  );
}
