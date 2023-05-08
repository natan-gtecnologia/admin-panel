import { Input } from "@growth/growforce-admin-ui/components/Common/Form/Input";
import { useFormContext } from "react-hook-form";
import {
    Col,
    FormFeedback,
    Label,
    Row,
} from '@growth/growforce-admin-ui/index';
import { CreateOrUpdateOrdersSchemaProps } from "./schema";
import { cepMask, cpfMask, dateMask, phoneMask } from "../../../utils/masks";
import { useCallback } from "react";
import { api } from "apps/growforce/admin-panel/services/apiClient";
import { debounce } from "lodash";

export function Identification() {
    const { formState, register, getValues, setValue, trigger, setError } = useFormContext<CreateOrUpdateOrdersSchemaProps>();

    async function getAddress(cep: string) {
        const addressResponse = await api.get(`/util/address/${cep}`);
        return {
            address: addressResponse.data,
        };
    }

    const _handleLoadAddress = useCallback(async () => {
        try {
            const cep = getValues('identity.billingAddress.postCode');
            if (!cep) throw new Error('Invalid cep');

            const cepWithoutMask = cep.replace(/[^\d]/g, '');
            if (cepWithoutMask.length < 8) throw new Error('Invalid cep');

            const response = await getAddress(cepWithoutMask);
            const address = response.address as any;
            setValue(`identity.billingAddress.address1`, address.logradouro);
            setValue(`identity.billingAddress.address2`, address.complemento);
            setValue(`identity.billingAddress.neighborhood`, address.bairro);
            setValue(`identity.billingAddress.city`, address.localidade);
            setValue(`identity.billingAddress.state`, address.uf.toLocaleUpperCase());
            trigger('identity.billingAddress');
        } catch (err) {
            setError(`identity.billingAddress.postCode`, {
                type: 'manual',
                message: 'CEP inválido',
            });
        }
    }, [getValues, setValue, trigger, setError]);

    const handleLoadAddress = debounce(_handleLoadAddress, 500);

    return (
        <div>
            <Row>
                <Col sm={6}>
                    <div className="mb-3">
                        <Label
                            htmlFor="firstName"
                            className="form-label"
                        >
                            Nome
                        </Label>
                        <Input
                            name='firstName'
                            type="text"
                            className="form-control"
                            id="firstName"
                            placeholder="Nome"
                            {...register('identity.firstName')}
                            invalid={!!formState.errors.identity?.firstName}
                        />
                        {formState.errors.identity?.firstName && (
                            <FormFeedback type="invalid">
                                {formState.errors.identity?.firstName.message}
                            </FormFeedback>
                        )}
                    </div>
                </Col>

                <Col sm={6}>
                    <div className="mb-3">
                        <Label
                            htmlFor="lastName"
                            className="form-label"
                        >
                            Sobrenome
                        </Label>
                        <Input
                            type="text"
                            className="form-control"
                            id="lastName"
                            placeholder="Sobrenome"
                            {...register('identity.lastName')}
                            invalid={!!formState.errors.identity?.lastName}
                        />
                        {formState.errors.identity?.lastName && (
                            <FormFeedback type="invalid">
                                {formState.errors.identity?.lastName.message}
                            </FormFeedback>
                        )}
                    </div>
                </Col>
            </Row>

            <Row>
                <Col sm={6}>
                    <div className="mb-3">
                        <Label
                            htmlFor="email"
                            className="form-label"
                        >
                            Email
                            <span className="text-muted">(Optional)</span>
                        </Label>
                        <Input
                            type="email"
                            className="form-control"
                            id="email"
                            placeholder="E-mail"
                            {...register('identity.email')}
                            invalid={!!formState.errors.identity?.email}
                        />
                        {formState.errors.identity?.email && (
                            <FormFeedback type="invalid">
                                {formState.errors.identity?.email.message}
                            </FormFeedback>
                        )}
                    </div>
                </Col>

                <Col sm={6}>
                    <div className="mb-3">
                        <Label
                            htmlFor="phone"
                            className="form-label"
                        >
                            Telefone
                        </Label>
                        <Input
                            type="text"
                            className="form-control"
                            id="phone"
                            placeholder="Telefone"
                            invalid={!!formState.errors.identity?.phone}
                            {...register('identity.phone', {
                                onChange: phoneMask.onChange
                            })}
                        />
                        {formState.errors.identity?.phone && (
                            <FormFeedback type="invalid">
                                {formState.errors.identity?.phone.message}
                            </FormFeedback>
                        )}
                    </div>
                </Col>
            </Row>

            <Row>
                <Col sm={6}>
                    <div className="mb-3">
                        <Label
                            htmlFor="phone"
                            className="form-label"
                        >
                            CPF
                        </Label>
                        <Input
                            type="text"
                            className="form-control"
                            id="cpf"
                            placeholder="Seu CPF"
                            {...register('identity.cpf', {
                                onChange: cpfMask.onChange,
                            })}
                            invalid={!!formState.errors.identity?.cpf}
                        />
                        {formState.errors.identity?.cpf && (
                            <FormFeedback type="invalid">
                                {formState.errors.identity?.cpf.message}
                            </FormFeedback>
                        )}
                    </div>
                </Col>
                <Col sm={6}>
                    <div className="mb-3">
                        <Label
                            htmlFor="birthDate"
                            className="form-label"
                        >
                            Data de nascimento
                        </Label>
                        <Input
                            type="date"
                            className="form-control"
                            id="date"
                            placeholder="Data de nascimento"
                            {...register('identity.birthDate')}
                            invalid={!!formState.errors.identity?.birthDate}
                        />
                        {formState.errors.identity?.birthDate && (
                            <FormFeedback type="invalid">
                                {formState.errors.identity?.birthDate.message}
                            </FormFeedback>
                        )}
                    </div>
                </Col>
            </Row>

            <Row>
                <div>
                    <h5 className="mt-2 mb-1">Endereço</h5>
                    <p className="text-muted mb-4">
                        Por favor, preencha todas as informações abaixo
                    </p>
                </div>

                <Col md={4}>
                    <div className="mb-3">
                        <Label htmlFor="billingAddress.postCode" className="form-label">
                            Cep
                        </Label>
                        <Input
                            type="text"
                            className="form-control"
                            id="billingAddress.postCode"
                            placeholder="Cep"
                            {...register('identity.billingAddress.postCode', {
                                onChange: (e) => {
                                    cepMask.onChange(e);
                                    handleLoadAddress();
                                },
                            })}
                            invalid={!!formState.errors?.identity?.billingAddress?.postCode}
                        />
                        {formState.errors?.identity?.billingAddress?.postCode && (
                            <FormFeedback type="invalid">
                                {formState.errors.identity?.billingAddress.postCode.message}
                            </FormFeedback>
                        )}
                    </div>
                </Col>
            </Row>

            <Row>
                <Col md={4}>
                    <div className="mb-3">
                        <Label
                            htmlFor="billingAddress.address1"
                            className="form-label"
                        >
                            Endereço
                        </Label>
                        <Input
                            type="text"
                            className="form-control"
                            id="billingAddress.address1"
                            placeholder="Endereço"
                            {...register('identity.billingAddress.address1')}
                            invalid={!!formState.errors?.identity?.billingAddress?.address1}
                        />
                        {formState.errors?.identity?.billingAddress?.address1 && (
                            <FormFeedback type="invalid">
                                {formState.errors.identity?.billingAddress.address1.message}
                            </FormFeedback>
                        )}
                    </div>
                </Col>
                <Col md={4}>
                    <div className="mb-3">
                        <Label
                            htmlFor="billingAddress.address2"
                            className="form-label"
                        >
                            Complemento
                        </Label>
                        <Input
                            type="text"
                            className="form-control"
                            id="billingAddress.address2"
                            placeholder="Complemento"
                            {...register('identity.billingAddress.address2')}
                            invalid={!!formState.errors?.identity?.billingAddress?.address2}
                        />
                        {formState.errors?.identity?.billingAddress?.address2 && (
                            <FormFeedback type="invalid">
                                {formState.errors.identity?.billingAddress.address2.message}
                            </FormFeedback>
                        )}
                    </div>
                </Col>
                <Col md={4}>
                    <div className="mb-3">
                        <Label
                            htmlFor="billingAddress.city"
                            className="form-label"
                        >
                            Cidade
                        </Label>
                        <Input
                            type="text"
                            className="form-control"
                            id="billingAddress.city"
                            placeholder="Cidade"
                            {...register('identity.billingAddress.city')}
                            invalid={!!formState.errors?.identity?.billingAddress?.city}
                        />
                        {formState.errors?.identity?.billingAddress?.city && (
                            <FormFeedback type="invalid">
                                {formState.errors?.identity?.billingAddress?.city.message}
                            </FormFeedback>
                        )}
                    </div>
                </Col>
            </Row>

            <Row>
                <Col md={4}>
                    <div className="mb-3">
                        <Label
                            htmlFor="billingAddress.number"
                            className="form-label"
                        >
                            Número
                        </Label>
                        <Input
                            type="text"
                            className="form-control"
                            id="billingAddress.number"
                            placeholder="Número"
                            {...register('identity.billingAddress.number')}
                            invalid={!!formState.errors?.identity?.billingAddress?.number}
                        />
                        {formState.errors?.identity?.billingAddress?.number && (
                            <FormFeedback type="invalid">
                                {formState.errors.identity?.billingAddress.number.message}
                            </FormFeedback>
                        )}
                    </div>
                </Col>
                <Col md={4}>
                    <div className="mb-3">
                        <Label htmlFor="billingAddress.neighborhood" className="form-label">
                            Bairro
                        </Label>
                        <Input
                            type="text"
                            className="form-control"
                            id="billingAddress.neighborhood"
                            placeholder="Bairro"
                            {...register("identity.billingAddress.neighborhood")}
                            invalid={!!formState.errors?.identity?.billingAddress?.neighborhood}
                        />
                        {formState.errors?.identity?.billingAddress?.neighborhood && (
                            <FormFeedback type="invalid">
                                {formState.errors.identity?.billingAddress.neighborhood.message}
                            </FormFeedback>
                        )}
                    </div>
                </Col>

                <Col md={4}>
                    <div className="mb-3">
                        <Label htmlFor="billingAddress.state" className="form-label">
                            Estado
                        </Label>
                        <Input
                            type="text"
                            className="form-control"
                            id="billingAddress.state"
                            placeholder="ES"
                            {...register("identity.billingAddress.state")}
                            invalid={!!formState.errors?.identity?.billingAddress?.state}
                        />
                        {formState.errors?.identity?.billingAddress?.state && (
                            <FormFeedback type="invalid">
                                {formState.errors.identity?.billingAddress.state.message}
                            </FormFeedback>
                        )}
                    </div>
                </Col>
            </Row>
        </div>
    )
}