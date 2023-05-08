import { Card } from '@growth/growforce-admin-ui/components/Common/Card';
import { Input } from '@growth/growforce-admin-ui/components/Common/Form/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import { formatDistance } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { debounce } from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Flatpickr from 'react-flatpickr';
import Select from 'react-select';
import { flatpickrPt } from '../../../utils/flatpick-pt';
import { cepMask, cnpjMask, cpfMask, phoneMask } from '../../../utils/masks';

import {
  Controller,
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

import QueryString from 'qs';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/apiClient';
import { queryClient } from '../../../services/react-query';
import { MetaData } from '../../MetaData';
import { CreateOrUpdateCustomersSchemaProps, customerSchema } from './schema';

type Props = {
  customers?: CreateOrUpdateCustomersSchemaProps & {
    createdAt: string;
    updatedAt: string;
    id: number;
  };
};

interface ResultCep {
  bairro: string;
  cep: string;
  complemento: string;
  ddd: string;
  gia: string;
  ibge: string;
  localidade: string;
  logradouro: string;
  siafi: string;
  uf: string;
}

const DEFAULT_COUPON: CreateOrUpdateCustomersSchemaProps = {
  firstName: '',
  lastName: '',
  documentType: 'cpf',
  document: '',
  email: '',
  address: {
    address1: '',
    address2: '',
    postCode: '',
    city: '',
    country: '',
    number: '',
    state: '',
    neighborhood: '',
  },
  metaData: [],
  orders: [],
  carts: [],
};

export function CreateOrEditCustomers({ customers }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [allOrders, setAllOrders] = useState([]);
  const [allCarts, setAllCarts] = useState([]);

  const form = useForm<CreateOrUpdateCustomersSchemaProps>({
    defaultValues: {
      ...DEFAULT_COUPON,
      ...customers,
    },
    resolver: zodResolver(customerSchema),
  });

  const {
    formState,
    handleSubmit,
    register,
    setValue,
    getValues,
    trigger,
    setError,
    watch,
    control,
  } = form;

  const { fields, append, remove } = useFieldArray({
    control: control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'metaData', // unique name for your Field Array
  });

  const documentTypeWatch = watch('documentType');
  const orders = watch('orders');
  const carts = watch('carts');

  const { mutateAsync: createOrUpdateFn } = useMutation(
    async (data: CreateOrUpdateCustomersSchemaProps) => {
      if (customers) {
        await api.put(`/customers/${customers.id}`, {
          data: {
            ...data,
            updatedBy: user?.id,
          },
        });
        return;
      }

      const response = await api.post('/customers', {
        data: {
          ...data,
          createdBy: user?.id,
          updatedBy: user?.id,
        },
      });

      router.push(
        `/customers/edit/${response.data.data.id}?success=true&message=Tag criada com sucesso!`,
      );
    },
    {
      onSuccess: (_, variables) => {
        if (customers?.id) {
          queryClient.setQueryData(['customers', customers.id], {
            ...customers,
            ...variables,
            updatedAt: new Date(),
          });
        }
      },
    },
  );

  const onCreateOrUpdateSubmit: SubmitHandler<
    CreateOrUpdateCustomersSchemaProps
  > = async (data) => {
    const number = data.mobilePhone.number.substring(5);
    const areaCode = data.mobilePhone.number.substring(1, 3);
    const newPhoneNumber = phoneMask.unmask(number);

    const dataCustomer = {
      ...data,
      document:
        documentTypeWatch === 'cpf'
          ? cpfMask.unmask(data.cpf)
          : documentTypeWatch === 'cnpj'
          ? cnpjMask.unmask(data.cnpj)
          : data.passport,
      mobilePhone: {
        countryCode: '55',
        areaCode: areaCode,
        number: newPhoneNumber,
      },
    };

    await createOrUpdateFn(dataCustomer);
  };

  const _handleLoadAddress = useCallback(async () => {
    try {
      const cep = getValues('address.postCode');
      if (!cep) throw new Error('Invalid cep');

      const cepWithoutMask = cep.replace(/[^\d]/g, '');
      if (cepWithoutMask.length < 8) throw new Error('Invalid cep');

      const response = await api.get(`/util/address/${cep}`);
      const address = response.data as ResultCep;

      setValue(`address.address1`, address.logradouro);
      setValue(`address.neighborhood`, address.bairro);
      setValue(`address.city`, address.localidade);
      setValue(`address.state`, address.uf.toLocaleUpperCase());
      trigger('address');
    } catch (err) {
      setError(`address.postCode`, {
        type: 'manual',
        message: 'CEP inválido',
      });
    }
  }, [getValues, setError, setValue, trigger]);
  const handleLoadAddress = debounce(_handleLoadAddress, 500);

  async function getOrders() {
    try {
      const { data } = await api.get('/orders');
      const { data: selectedOrders } = await api.get('/orders', {
        params: {
          filters: {
            id: {
              $in: orders,
            },
          },
        },
        paramsSerializer: (params) => {
          return QueryString.stringify(params);
        },
      });

      const dataOrders = data.data.map((order) => {
        return { value: order.id, label: order.id };
      });

      const selectedDataOrders = selectedOrders.data.map((order) => {
        return { value: order.id, label: order.id };
      });

      const options = [...dataOrders, ...selectedDataOrders];

      setAllOrders(
        options.filter((value, index) => {
          const _value = JSON.stringify(value);
          return (
            index ===
            options.findIndex((obj) => {
              return JSON.stringify(obj) === _value;
            })
          );
        }),
      );
    } catch (error) {
      console.log(error);
    }
  }

  async function getCarts() {
    try {
      const { data } = await api.get('/carts');
      const { data: selectedCarts } = await api.get('/carts', {
        params: {
          filters: {
            hash: {
              $in: carts,
            },
          },
        },
        paramsSerializer: (params) => {
          return QueryString.stringify(params);
        },
      });

      const dataCarts = data.data.map((cart) => {
        return { value: cart.id, label: cart.attributes.hash };
      });

      const selectedDataCarts = selectedCarts.data.map((cart) => {
        return { value: cart.id, label: cart.attributes.hash };
      });

      const options = [...dataCarts, ...selectedDataCarts];

      setAllCarts(
        options.filter((value, index) => {
          const _value = JSON.stringify(value);
          return (
            index ===
            options.findIndex((obj) => {
              return JSON.stringify(obj) === _value;
            })
          );
        }),
      );
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (documentTypeWatch === 'cpf') {
      setValue('cnpj', '');
      setValue('passport', '');
    } else if (documentTypeWatch === 'cnpj') {
      setValue('cpf', '');
      setValue('passport', '');
    } else {
      setValue('cnpj', '');
      setValue('cpf', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentTypeWatch]);

  useEffect(() => {
    if (customers?.mobilePhone?.number) {
      setValue(
        'mobilePhone.number',
        phoneMask.mask(customers?.mobilePhone?.number),
      );
    }
    if (customers?.documentType === 'cpf') {
      setValue('cpf', cpfMask.mask(customers.document));
    }
    if (customers?.documentType === 'cnpj') {
      setValue('cnpj', cnpjMask.mask(customers.document));
    }
    if (customers?.documentType === 'passport') {
      setValue('passport', customers.document);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers]);

  useEffect(() => {
    getOrders();
    getCarts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                  <Col md={12}>
                    <div className="d-flex align-items-center">
                      <h6 className="card-title mb-1">Dados do cliente</h6>
                    </div>
                    <p>Insira as principais informações sobre o seu cliente</p>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Label className="form-label" htmlFor="firstName">
                      Nome
                    </Label>
                    <Input
                      type="text"
                      id="firstName"
                      placeholder="Nome do cliente"
                      invalid={!!formState.errors.firstName}
                      {...register('firstName')}
                    />
                    {formState.errors.firstName && (
                      <FormFeedback type="invalid">
                        {formState.errors.firstName.message}
                      </FormFeedback>
                    )}
                  </Col>
                  <Col md={6}>
                    <Label className="form-label" htmlFor="lastName">
                      Sobrenome
                    </Label>
                    <Input
                      type="text"
                      id="lastName"
                      placeholder="Sobrenome"
                      invalid={!!formState.errors.lastName}
                      {...register('lastName')}
                    />
                    {formState.errors.lastName && (
                      <FormFeedback type="invalid">
                        {formState.errors.lastName.message}
                      </FormFeedback>
                    )}
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={6}>
                    <Label className="form-label" htmlFor="productType">
                      Documento
                    </Label>
                    <select
                      className={clsx('form-select', {
                        'is-invalid': !!formState.errors.documentType,
                      })}
                      aria-label="Tipo de documento"
                      id="documentType"
                      {...register('documentType')}
                    >
                      <option value="cpf">CPF</option>
                      <option value="cnpj">CNPJ</option>
                      <option value="passport">Passaporte</option>
                    </select>

                    {!!formState.errors.documentType && (
                      <FormFeedback type="invalid">
                        {formState.errors.documentType.message}
                      </FormFeedback>
                    )}
                  </Col>

                  {documentTypeWatch === 'cpf' && (
                    <Col md={6}>
                      <Label className="form-label" htmlFor="cpf">
                        CPF
                      </Label>
                      <Input
                        type="text"
                        id="cpf"
                        placeholder="123.456.789-10"
                        invalid={!!formState.errors.cpf}
                        {...register('cpf', { onChange: cpfMask.onChange })}
                      />
                      {formState.errors.cpf && (
                        <FormFeedback type="invalid">
                          {formState.errors.cpf.message}
                        </FormFeedback>
                      )}
                    </Col>
                  )}

                  {documentTypeWatch === 'cnpj' && (
                    <Col md={6}>
                      <Label className="form-label" htmlFor="cnpj">
                        CNPJ
                      </Label>
                      <Input
                        type="text"
                        id="cnpj"
                        placeholder="12.345.678/0001-00"
                        invalid={!!formState.errors.cnpj}
                        {...register('cnpj', { onChange: cnpjMask.onChange })}
                      />
                      {formState.errors.cnpj && (
                        <FormFeedback type="invalid">
                          {formState.errors.cnpj.message}
                        </FormFeedback>
                      )}
                    </Col>
                  )}

                  {documentTypeWatch === 'passport' && (
                    <Col md={6}>
                      <Label className="form-label" htmlFor="passport">
                        Passaporte
                      </Label>
                      <Input
                        type="text"
                        id="passport"
                        placeholder="Informe seu passaporte"
                        styled={{ textTransform: 'uppercase' }}
                        invalid={!!formState.errors.passport}
                        {...register('passport')}
                      />
                      {formState.errors.passport && (
                        <FormFeedback type="invalid">
                          {formState.errors.passport.message}
                        </FormFeedback>
                      )}
                    </Col>
                  )}
                </Row>

                <Row className="mt-3">
                  <Col md={4}>
                    <Label className="form-label" htmlFor="birthDate">
                      Data de nascimento
                    </Label>

                    <Controller
                      control={control}
                      name="birthDate"
                      render={({ field }) => (
                        <Flatpickr
                          placeholder="Data de nascimento"
                          className={clsx('form-control')}
                          options={{
                            dateFormat: 'd/m/Y',
                            locale: flatpickrPt,
                          }}
                          value={field.value}
                          onChange={(date) => field.onChange(date[0])}
                        />
                      )}
                    />
                  </Col>
                  <Col md={4}>
                    <Label className="form-label" htmlFor="email">
                      Email
                    </Label>
                    <Input
                      type="text"
                      id="email"
                      placeholder="Email do cliente"
                      invalid={!!formState.errors.email}
                      {...register('email')}
                    />
                    {formState.errors.email && (
                      <FormFeedback type="invalid">
                        {formState.errors.email.message}
                      </FormFeedback>
                    )}
                  </Col>
                  <Col md={4}>
                    <Label className="form-label" htmlFor="mobilePhone">
                      Telefone
                    </Label>

                    <Input
                      type="tel"
                      id="mobilePhone"
                      placeholder="(27) 9 1234-5678"
                      invalid={!!formState.errors.mobilePhone}
                      {...register('mobilePhone.number', {
                        onChange: phoneMask.onChange,
                      })}
                    />

                    {formState.errors.mobilePhone?.number && (
                      <FormFeedback type="invalid">
                        {formState.errors.mobilePhone?.number?.message}
                      </FormFeedback>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                <Row>
                  <Col md={12}>
                    <div className="d-flex align-items-center">
                      <h6 className="card-title mb-1">Endereço</h6>
                    </div>
                    <p>O endereço principal do cliente será este</p>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Label className="form-label" htmlFor="country">
                      País
                    </Label>
                    <Input
                      type="text"
                      id="country"
                      placeholder="Informe o país"
                      invalid={!!formState.errors.address?.country}
                      {...register('address.country')}
                    />
                    {formState.errors.address?.country && (
                      <FormFeedback type="invalid">
                        {formState.errors.address?.country.message}
                      </FormFeedback>
                    )}
                  </Col>
                  <Col md={6}>
                    <Label className="form-label" htmlFor="postCode">
                      CEP
                    </Label>
                    <Input
                      type="text"
                      id="postCode"
                      placeholder="CEP"
                      maxLength={9}
                      invalid={!!formState.errors.address?.postCode}
                      {...register('address.postCode', {
                        onChange: (e) => {
                          cepMask.onChange(e);
                          handleLoadAddress();
                        },
                      })}
                    />
                    {formState.errors.address?.postCode && (
                      <FormFeedback type="invalid">
                        {formState.errors.address?.postCode.message}
                      </FormFeedback>
                    )}
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={6}>
                    <Label className="form-label" htmlFor="state">
                      Estado
                    </Label>
                    <Input
                      type="text"
                      id="state"
                      placeholder="Informe seu estado"
                      invalid={!!formState.errors.address?.state}
                      {...register('address.state')}
                    />
                    {formState.errors.address?.state && (
                      <FormFeedback type="invalid">
                        {formState.errors.address?.state.message}
                      </FormFeedback>
                    )}
                  </Col>
                  <Col md={6}>
                    <Label className="form-label" htmlFor="city">
                      Cidade
                    </Label>
                    <Input
                      type="text"
                      id="city"
                      placeholder="Informe a cidade"
                      invalid={!!formState.errors.address?.city}
                      {...register('address.city')}
                    />
                    {formState.errors.address?.city && (
                      <FormFeedback type="invalid">
                        {formState.errors.address?.city.message}
                      </FormFeedback>
                    )}
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={6}>
                    <Label className="form-label" htmlFor="neighborhood">
                      Bairro
                    </Label>
                    <Input
                      type="text"
                      id="neighborhood"
                      placeholder="Informe o bairro"
                      invalid={!!formState.errors.address?.neighborhood}
                      {...register('address.neighborhood')}
                    />
                    {formState.errors.address?.neighborhood && (
                      <FormFeedback type="invalid">
                        {formState.errors.address?.neighborhood.message}
                      </FormFeedback>
                    )}
                  </Col>
                  <Col md={6}>
                    <Label className="form-label" htmlFor="address">
                      Endereço
                    </Label>
                    <Input
                      type="text"
                      id="address"
                      placeholder="Informe o endereço"
                      invalid={!!formState.errors.address?.address1}
                      {...register('address.address1')}
                    />
                    {formState.errors.address?.address1 && (
                      <FormFeedback type="invalid">
                        {formState.errors.address?.address1.message}
                      </FormFeedback>
                    )}
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={6}>
                    <Label className="form-label" htmlFor="address2">
                      Complemento
                    </Label>
                    <Input
                      type="text"
                      id="address2"
                      placeholder="Complemento"
                      invalid={!!formState.errors.address?.address2}
                      {...register('address.address2')}
                    />
                    {formState.errors.address?.address2 && (
                      <FormFeedback type="invalid">
                        {formState.errors.address?.address2.message}
                      </FormFeedback>
                    )}
                  </Col>
                  <Col md={6}>
                    <Label className="form-label" htmlFor="number">
                      Número
                    </Label>
                    <Input
                      type="text"
                      id="number"
                      placeholder="Número da residência"
                      invalid={!!formState.errors.address?.number}
                      {...register('address.number')}
                    />
                    {formState.errors.address?.number && (
                      <FormFeedback type="invalid">
                        {formState.errors.address?.number.message}
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
                    {formatDistance(
                      new Date(customers?.createdAt || new Date()),
                      new Date(),
                      {
                        locale: ptBR,
                        addSuffix: true,
                        includeSeconds: true,
                      },
                    )}
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
                    Última atualização
                  </h5>

                  <p className="mb-0">
                    {formatDistance(
                      new Date(customers?.updatedAt || new Date()),
                      new Date(),
                      {
                        locale: ptBR,
                        addSuffix: true,
                        includeSeconds: true,
                      },
                    )}
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
            <Card className="shadow-none">
              <Card.Header>
                <h4 className="fs-5 text-body m-0 fw-bold">Relacionamentos</h4>
              </Card.Header>

              <Card.Body>
                <Row>
                  <Col lg={12}>
                    <div>
                      <Label className="form-label" htmlFor="orders">
                        Pedidos
                      </Label>

                      <Controller
                        control={control}
                        name="orders"
                        render={({ field: { onChange, value, name, ref } }) => (
                          <Select
                            name={name}
                            isSearchable={true}
                            className="basic-single"
                            classNamePrefix="select"
                            placeholder="Selecione o pedido"
                            options={allOrders}
                            value={allOrders.filter((c) =>
                              value?.includes(c.value),
                            )}
                            ref={ref}
                            onChange={(val) => {
                              const ids = val.map((option) => option.value);
                              onChange(ids);
                            }}
                            isMulti
                          />
                        )}
                      />
                    </div>
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col lg={12}>
                    <div>
                      <Label className="form-label" htmlFor="carts">
                        Carrinhos
                      </Label>

                      <Controller
                        control={control}
                        name="carts"
                        render={({ field: { onChange, value, name, ref } }) => (
                          <Select
                            name={name}
                            isSearchable={true}
                            className="basic-single"
                            classNamePrefix="select"
                            placeholder="Selecione o carrinho"
                            options={allCarts}
                            value={allCarts.filter((c) =>
                              value?.includes(c.value),
                            )}
                            ref={ref}
                            onChange={(val) => {
                              const ids = val.map((option) => option.value);
                              onChange(ids);
                            }}
                            isMulti
                          />
                        )}
                      />
                    </div>
                  </Col>
                </Row>
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
                  Excluir
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
                        {customers?.id ? 'Editando...' : 'Criando...'}
                      </Spinner>
                      <span className="ms-2">
                        {customers?.id ? 'Editando...' : 'Criando...'}
                      </span>
                    </span>
                  ) : (
                    <>{customers?.id ? 'Editar' : 'Inserir'} cliente</>
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
