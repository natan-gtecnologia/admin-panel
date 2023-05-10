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
  data?: CreateOrUpdateSchemaType;
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

export function CreateOrUpdate({ data = DEFAULT }: Props) {
  const formProps = useForm<CreateOrUpdateSchemaType>({
    resolver: zodResolver(createOrUpdateSchema),
    defaultValues: data,
  });
  const { handleSubmit } = formProps;

  const onCreateOrUpdate = useCallback<SubmitHandler<CreateOrUpdateSchemaType>>(
    async (values) => {
      const id = toast.loading("Salvando live...");
      try {
        if (data.id) {
          delete values.id;

          await api.put(`/live-streams/${data.id}`, {
            data: values,
          });
          return;
        }

        const response = await api.post("/live-streams", {
          data: values,
        });

        await Router.push(`/live-stream/${response.data.data.id}`);

        toast.update(id, {
          render: "Live salva com sucesso",
          type: "success",
          isLoading: false,
        });
      } catch (error) {
        toast.update(id, {
          render: "Erro ao salvar live",
          type: "error",
          isLoading: false,
        });
      }
    },
    [data?.id]
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
