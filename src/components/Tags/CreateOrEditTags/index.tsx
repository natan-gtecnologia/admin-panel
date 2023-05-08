import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FormProvider,
  SubmitHandler,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import {
  Button,
  Col,
  Form,
  FormFeedback,
  Label,
  Row,
  Spinner,
} from 'reactstrap';

import { ITag } from '../../../@types/tag';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/apiClient';
import { queryClient } from '../../../services/react-query';
import { MetaData } from '../../MetaData';
import { TimeUpdated } from '../../TimeUpdated';
import { CreateOrUpdateTagsSchemaProps, tagsSchema } from './schema';

type Props = {
  tag?: ITag;
};

const DEFAULT_COUPON: CreateOrUpdateTagsSchemaProps = {
  tag: '',
  color: '#364574',
  metaData: [],
};

export function CreateOrEditTags({ tag }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { formState, handleSubmit, register, ...form } =
    useForm<CreateOrUpdateTagsSchemaProps>({
      defaultValues: {
        ...DEFAULT_COUPON,
        ...tag,
      },
      resolver: zodResolver(tagsSchema),
    });
  const { fields, append, remove } = useFieldArray({
    control: form.control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'metaData', // unique name for your Field Array
  });

  const { mutateAsync: createOrUpdateFn } = useMutation(
    async (data: CreateOrUpdateTagsSchemaProps) => {
      if (tag) {
        await api.put(`/tags/${tag.id}`, {
          data: {
            ...data,
            updatedBy: user?.id,
          },
        });
        return;
      }

      const response = await api.post('/tags', {
        data: {
          ...data,
          createdBy: user?.id,
          updatedBy: user?.id,
        },
      });
      await router.push(
        `/tags/edit/${response.data.data.id}?success=true&message=Tag criada com sucesso!`,
      );
    },
    {
      onSuccess: (_, variables) => {
        if (tag?.id) {
          queryClient.setQueryData(['tags', tag.id], {
            ...tag,
            ...variables,
            updatedAt: new Date(),
          });
        }
      },
    },
  );

  const onCreateOrUpdateSubmit: SubmitHandler<
    CreateOrUpdateTagsSchemaProps
  > = async (data) => {
    await createOrUpdateFn(data);
  };

  return (
    <FormProvider
      formState={formState}
      handleSubmit={handleSubmit}
      register={register}
      {...form}
    >
      <Form onSubmit={handleSubmit(onCreateOrUpdateSubmit)}>
        <Row>
          <Col lg={8}>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Label className="form-label" htmlFor="tag">
                      Tag*
                    </Label>
                    <Input
                      type="text"
                      id="tag"
                      placeholder="Insira o título da tag"
                      invalid={!!formState.errors.tag}
                      {...register('tag')}
                    />
                    {formState.errors.tag && (
                      <FormFeedback type="invalid">
                        {formState.errors.tag.message}
                      </FormFeedback>
                    )}
                  </Col>
                  <Col md={6}>
                    <Label className="form-label" htmlFor="color">
                      Cor
                    </Label>
                    <Input
                      type="color"
                      className="form-control form-control-color w-100"
                      id="colorPicker"
                      invalid={!!formState.errors.color}
                      {...register('color')}
                    />
                    {formState.errors.color && (
                      <FormFeedback type="invalid">
                        {formState.errors.color.message}
                      </FormFeedback>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <Row>
                  <div className="d-flex align-items-center">
                    <Col md={8}>
                      <div className="d-flex align-items-center">
                        <h6 className="card-title mb-0">Meta Data</h6>
                      </div>
                    </Col>

                    <Col md={4}>
                      <div className="d-flex justify-content-end">
                        <Button
                          color="link"
                          className="shadow-none"
                          onClick={() => append({})}
                        >
                          Adicionar nova
                        </Button>
                      </div>
                    </Col>
                  </div>
                </Row>
              </Card.Header>
              {fields.map((field, key) => (
                <Card.Body key={field.id}>
                  <MetaData indexKey={key} onRemove={remove} />
                </Card.Body>
              ))}
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="shadow-none">
              <Card.Header>
                <h4 className="fs-5 text-body m-0 fw-bold">Informação</h4>
              </Card.Header>

              <Card.Body>
                <div className="mb-3 d-flex align-items-center justify-content-between">
                  <h5
                    className="fw-bold"
                    style={{
                      fontSize: '0.875rem',
                      marginBottom: '0',
                    }}
                  >
                    Criada
                  </h5>

                  <p className="mb-0">
                    <TimeUpdated
                      time={
                        tag?.createdAt ? new Date(tag?.createdAt) : new Date()
                      }
                    />
                  </p>
                </div>

                {/*<div className="mb-3 d-flex align-items-center justify-content-between">
                  <h5
                    className="fw-bold"
                    style={{
                      fontSize: '0.875rem',
                      marginBottom: '0',
                    }}
                  >
                    Por
                  </h5>

                  <p className="mb-0">Nalu nalu</p>
                </div>*/}

                <div className="mb-3 d-flex align-items-center justify-content-between">
                  <h5
                    className="fw-bold"
                    style={{
                      fontSize: '0.875rem',
                      marginBottom: '0',
                    }}
                  >
                    Última atualização
                  </h5>

                  <p className="mb-0">
                    <TimeUpdated
                      time={
                        tag?.updatedAt ? new Date(tag?.updatedAt) : new Date()
                      }
                    />
                  </p>
                </div>

                <div className="mb-3 d-flex align-items-center justify-content-between">
                  <h5
                    className="fw-bold"
                    style={{
                      fontSize: '0.875rem',
                      marginBottom: '0',
                    }}
                  >
                    Por
                  </h5>

                  <p className="mb-0">Nalu nalu</p>
                </div>
              </Card.Body>
            </Card>

            <Row>
              <Col>
                <Link
                  className="btn btn-light shadow-none border-0"
                  href="/tags"
                  style={{
                    width: '100%',
                    background: '#F06548',

                    color: '#fff',
                  }}
                >
                  Descartar
                </Link>
              </Col>

              <Col>
                <Button
                  color="success"
                  style={{
                    width: '100%',
                  }}
                  className={clsx('shadow-none border-0', {
                    'btn-load': formState.isSubmitting,
                  })}
                >
                  {formState.isSubmitting ? (
                    <span className="d-flex align-items-center justify-content-center">
                      <Spinner
                        size="sm"
                        className="flex-shrink-0"
                        role="status"
                      >
                        {tag?.id ? 'Editando...' : 'Criando...'}
                      </Spinner>
                      <span className="ms-2">
                        {tag?.id ? 'Editando...' : 'Criando...'}
                      </span>
                    </span>
                  ) : (
                    <>{tag?.id ? 'Editar' : 'Criar'} tag</>
                  )}
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </FormProvider>
  );
}
