import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import {
  Button,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Label,
  Row,
  Spinner,
} from 'reactstrap';
import { cepMask, cnpjMask, phoneMask } from '../../../utils/masks';

import debounce from 'lodash/debounce';
import QueryString from 'qs';
import { useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/apiClient';
import { queryClient } from '../../../services/react-query';
import { getAddress } from '../../../utils/getAddress';
import { TimeUpdated } from '../../TimeUpdated';
import { Relations } from './Relations';
import { companySchema, CreateOrUpdateCompanySchema } from './schema';

type Props = {
  company?: CreateOrUpdateCompanySchema & {
    updatedAt: string;
    createdAt: string;
  };
};

const DEFAULT_COUPON: CreateOrUpdateCompanySchema = {
  cnpj: '',
  email: '',
  name: '',
  phone: '',
  priceList: null,
  address: {
    address1: '',
    address2: '',
    postCode: '',
    city: '',
    neighborhood: '',
    state: '',
    country: 'BR',
    number: '',
  },
};

export function CreateOrUpdateCompany({ company }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { formState, handleSubmit, register, ...form } =
    useForm<CreateOrUpdateCompanySchema>({
      defaultValues: {
        ...DEFAULT_COUPON,
        ...company,
      },
      resolver: zodResolver(companySchema),
    });

  const { mutateAsync: createOrUpdateFn } = useMutation(
    async (data: CreateOrUpdateCompanySchema) => {
      try {
        delete data.id;
        delete data.nodeId;

        if (company) {
          delete data.company; // cannot update company relation

          await api.put(
            `/companies/${company.id}`,
            {
              data: {
                ...data,
              },
            },
            {
              params: {
                populate: '*',
              },
              paramsSerializer: (params) => {
                return QueryString.stringify(params);
              },
            },
          );

          return;
        }

        const response = await api.post('/companies', {
          data: {
            ...data,
            createdBy: user?.id,
            updatedBy: user?.id,
          },
        });
        await router.push(
          `/companies/edit/${response.data.data.id}?success=true&message=Empresa criada com sucesso!`,
        );
      } catch (error) {
        console.log('Não foi possível criar a empresa');
      }
    },
    {
      onSuccess: (_, variables) => {
        if (company?.id) {
          queryClient.setQueryData(['companies', company.id], {
            ...company,
            ...variables,
            updatedAt: new Date(),
          });
        }
      },
    },
  );

  const onCreateOrUpdateSubmit: SubmitHandler<
    CreateOrUpdateCompanySchema
  > = async (data) => {
    await createOrUpdateFn(data);
  };

  const _onAddressRequest = useCallback(
    async (cep: string) => {
      try {
        const { address } = await getAddress(cepMask.unmask(cep));

        form.setValue('address.address1', address.logradouro);
        form.setValue('address.neighborhood', address.bairro);
        form.setValue('address.city', address.localidade);
        form.setValue('address.state', address.uf);
      } catch (error) {
        form.setError('address.address2', {
          type: 'manual',
          message: 'CEP não encontrado',
        });
      }
    },
    [form],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onAddressRequest = useCallback(debounce(_onAddressRequest, 500), [
    _onAddressRequest,
  ]);

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
                <h4 className="fs-5 text-body m-0 fw-bold">Dados da empresa</h4>
                <p>Insira as principais informações sobre a empresa</p>
                <FormGroup>
                  <Label className="form-label" htmlFor="name">
                    Nome*
                  </Label>
                  <Input
                    type="text"
                    id="name"
                    placeholder="Insira o título da empresa"
                    invalid={!!formState.errors.name}
                    {...register('name')}
                  />
                  {formState.errors.name && (
                    <FormFeedback type="invalid">
                      {formState.errors.name.message}
                    </FormFeedback>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label className="form-label" htmlFor="cnpj">
                    CNPJ*
                  </Label>
                  <Input
                    type="text"
                    id="cnpj"
                    inputMode="numeric"
                    placeholder="Insira o CNPJ da empresa"
                    invalid={!!formState.errors.cnpj}
                    {...register('cnpj', {
                      onChange: cnpjMask.onChange,
                    })}
                  />
                  {formState.errors.cnpj && (
                    <FormFeedback type="invalid">
                      {formState.errors.cnpj.message}
                    </FormFeedback>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label className="form-label" htmlFor="email">
                    E-mail*
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="Insira o e-mail da empresa"
                    invalid={!!formState.errors.email}
                    {...register('email')}
                  />
                  {formState.errors.email && (
                    <FormFeedback type="invalid">
                      {formState.errors.email.message}
                    </FormFeedback>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label className="form-label" htmlFor="phone">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    inputMode="numeric"
                    placeholder="Insira o telefone da empresa"
                    invalid={!!formState.errors.phone}
                    {...register('phone', {
                      onChange: phoneMask.onChange,
                    })}
                  />
                  {formState.errors.phone && (
                    <FormFeedback type="invalid">
                      {formState.errors.phone.message}
                    </FormFeedback>
                  )}
                </FormGroup>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                <h4 className="fs-5 text-body m-0 fw-bold">Endereço</h4>
                <p>Insira o endereço da empresa</p>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="address.cep">CEP</Label>
                      <Input
                        id="address.cep"
                        inputMode="numeric"
                        placeholder="Digite o CEP"
                        invalid={!!formState.errors.address?.postCode}
                        {...register('address.postCode', {
                          onChange: (e) => {
                            onAddressRequest(e.target.value);
                            cepMask.onChange(e);
                          },
                        })}
                      />
                      {formState.errors.address?.postCode && (
                        <FormFeedback type="invalid">
                          {formState.errors.address.postCode.message}
                        </FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="address.address">Endereço</Label>
                      <Input
                        id="address.address"
                        placeholder="Digite o endereço"
                        invalid={!!formState.errors.address?.address1}
                        {...register('address.address1')}
                      />
                      {formState.errors.address?.address1 && (
                        <FormFeedback type="invalid">
                          {formState.errors.address.address1.message}
                        </FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={8}>
                    <FormGroup>
                      <Label for="address.complement">Complemento</Label>
                      <Input
                        id="address.complement"
                        placeholder="Digite o complemento"
                        invalid={!!formState.errors.address?.address2}
                        {...register('address.address2')}
                      />
                      {formState.errors.address?.address2 && (
                        <FormFeedback type="invalid">
                          {formState.errors.address.address2.message}
                        </FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="address.number">Número</Label>
                      <Input
                        id="address.number"
                        inputMode="numeric"
                        placeholder="Digite o número"
                        invalid={!!formState.errors.address?.number}
                        {...register('address.number')}
                      />
                      {formState.errors.address?.number && (
                        <FormFeedback type="invalid">
                          {formState.errors.address.number.message}
                        </FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="address.neighborhood">Bairro</Label>
                      <Input
                        id="address.neighborhood"
                        placeholder="Digite o bairro"
                        invalid={!!formState.errors.address?.neighborhood}
                        {...register('address.neighborhood')}
                      />
                      {formState.errors.address?.neighborhood && (
                        <FormFeedback type="invalid">
                          {formState.errors.address.neighborhood.message}
                        </FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="address.city">Cidade</Label>
                      <Input
                        id="address.city"
                        placeholder="Digite a cidade"
                        invalid={!!formState.errors.address?.city}
                        {...register('address.city')}
                      />
                      {formState.errors.address?.city && (
                        <FormFeedback type="invalid">
                          {formState.errors.address.city.message}
                        </FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="address.state">Estado</Label>
                      <Input
                        id="address.state"
                        placeholder="Digite o estado"
                        invalid={!!formState.errors.address?.state}
                        {...register('address.state')}
                      />
                      {formState.errors.address?.state && (
                        <FormFeedback type="invalid">
                          {formState.errors.address.state.message}
                        </FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="address.country">País</Label>
                      <Input
                        id="address.country"
                        placeholder="Digite o país"
                        invalid={!!formState.errors.address?.country}
                        readOnly
                        disabled
                        {...register('address.country')}
                      />
                      {formState.errors.address?.country && (
                        <FormFeedback type="invalid">
                          {formState.errors.address.country.message}
                        </FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                </Row>
              </Card.Body>
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
                        company?.createdAt
                          ? new Date(company?.createdAt)
                          : new Date()
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
                        company?.updatedAt
                          ? new Date(company?.updatedAt)
                          : new Date()
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
              </Card.Body>
            </Card>

            <Relations />

            <Row>
              <Col>
                <Link
                  className="btn btn-light shadow-none border-0"
                  href="/companies"
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
                        {company?.id ? 'Editando...' : 'Criando...'}
                      </Spinner>
                      <span className="ms-2">
                        {company?.id ? 'Editando...' : 'Criando...'}
                      </span>
                    </span>
                  ) : (
                    <>{company?.id ? 'Editar' : 'Criar'} empresa</>
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
