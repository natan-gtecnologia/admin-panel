import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { Header } from "./Header";
import { CreateOrUpdateSchemaType, createOrUpdateSchema } from "./schema";

type Props = {
  data?: CreateOrUpdateSchemaType;
};

const DEFAULT: CreateOrUpdateSchemaType = {
  title: "",
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
      </form>
    </FormProvider>
  );
}
