import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
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
  afterLiveTime: 0,
  aiTags: [],
  broadcasters: [],
  chatReleased: false,
  coupons: [],
  initialLiveText: "",
  products: [],
  liveCover: null,
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
    async (values) => {},
    []
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
