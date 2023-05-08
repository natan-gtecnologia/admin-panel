/* eslint-disable @next/next/no-img-element */
import { Input } from "@growth/growforce-admin-ui/components/Common/Form/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  FormFeedback,
  Label,
  Row,
  Spinner,
} from "reactstrap";
import { z } from "zod";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import { withSSRGuest } from "../../utils/withSSRGuest";
import LogoGrowforce from "/public/svg/logo-growforce.svg";

const emailSchema = z.string().email("Este e-mail é inválido");
const usernameSchema = z
  .string()
  .min(3, "Por favor, insira um nome de usuário com no mínimo 3 caracteres.");

const schema = z.object({
  usernameOrEmail: z
    .string()
    .min(1, "Nome de usuário ou e-mail não pode ser vazio")
    .refine((value) => {
      if (value.includes("@")) {
        try {
          emailSchema.parse(value);
          return true;
        } catch {
          return false;
        }
      }
      try {
        usernameSchema.parse(value);
        return true;
      } catch {
        return false;
      }
    }, "Por favor, insira um e-mail ou um nome de usuário válido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});
type FormProps = z.infer<typeof schema>;
type Required<T> = {
  [P in keyof T]-?: T[P];
};

import styles from "./Loader.module.css";

const Loader = () => {
  return (
    <div className={styles.loader}>
      <div className={styles.spinner}></div>
    </div>
  );
};

const ParticlesAuth = ({
  children,
  backgroudColor,
}: {
  children: React.ReactNode;
  backgroudColor?: string;
}) => {
  return (
    <div className="auth-page-wrapper pt-4">
      <div
        className="auth-one-bg-position auth-one-bg"
        style={{ backgroundImage: "none" }}
        id="auth-particles"
      >
        <div
          style={{
            background: `${backgroudColor || "#6233D6"}`,
            width: "100%",
            height: "100%",
            opacity: "0.9",
          }}
        ></div>

        <div className="shape">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 1440 120"
          >
            <path d="M 0,36 C 144,53.6 432,123.2 720,124 C 1008,124.8 1296,56.8 1440,40L1440 140L0 140z"></path>
          </svg>
        </div>
      </div>

      {children}

      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="text-center">
                <p className="mb-0 text-muted">
                  &copy; {new Date().getFullYear()} Growforce. Criado com{" "}
                  <i className="mdi mdi-heart text-danger"></i> por time de
                  produto
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Login: NextPage = () => {
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { config } = useSettings();
  const [loaded, setLoaded] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const { handleSubmit, register, formState } = useForm<FormProps>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  });

  useEffect(() => {
    if (pageLoaded) {
      setLoaded(true);
    } else {
      const timer = setTimeout(() => {
        setLoaded(true);
      }, 500);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [pageLoaded]);

  useEffect(() => {
    const handleLoad = () => {
      setPageLoaded(true);
      setLoaded(false);
    };

    window.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  const onSubmit: SubmitHandler<Required<FormProps>> = async (data) => {
    try {
      await signIn(data);
    } catch {
      toast.error("Email ou senha incorretos");
    }
  };

  return (
    <>
      {!loaded && <Loader />}
      <ParticlesAuth backgroudColor={config?.color_scheme.primary}>
        <Head>
          <title>Login - GrowForce</title>
        </Head>
        <div className="auth-page-content">
          <Container>
            <Row>
              <Col lg={12}>
                <div className="text-center mb-3 text-white-50">
                  <div>
                    <Link href="/" className="d-inline-block auth-logo">
                      {config && config?.logo ? (
                        <Image
                          src={config?.logo}
                          alt="logo sistema"
                          width={200}
                          height={50}
                        />
                      ) : (
                        <LogoGrowforce />
                      )}
                    </Link>
                  </div>
                </div>
              </Col>
            </Row>

            <Row className="justify-content-center">
              <Col md={8} lg={6} xl={5}>
                <Card className="mt-4">
                  <CardBody className="p-4">
                    <div className="text-center mt-2">
                      <h5 className="user-name-text">Bem-vindo de volta!</h5>
                      <p className="text-muted">{`Faça login para continuar para ${
                        config?.name_system || "Growforce"
                      }`}</p>
                    </div>
                    <div className="p-2 mt-4">
                      <form
                        onSubmit={handleSubmit(onSubmit)}
                        autoComplete="off"
                      >
                        <div className="mb-3">
                          <Label
                            htmlFor="usernameOrEmail"
                            className="form-label"
                          >
                            Nome de Usuário ou Email
                          </Label>
                          <Input
                            name="usernameOrEmail"
                            type="text"
                            placeholder="Digite o acesso"
                            invalid={!!formState.errors.usernameOrEmail}
                            {...register("usernameOrEmail")}
                          />
                          <FormFeedback type="invalid">
                            {formState.errors.usernameOrEmail?.message}
                          </FormFeedback>
                        </div>

                        <div className="mb-3">
                          {/*<div className="float-end">
                          <Link href="/" className="text-muted">
                            Esqueceu a senha?
                          </Link>
                        </div>*/}
                          <Label
                            className="form-label"
                            htmlFor="password-input"
                          >
                            Senha
                          </Label>
                          <div className="position-relative auth-pass-inputgroup">
                            <Input
                              name="password"
                              type={showPassword === true ? "text" : "password"}
                              className="form-control pe-5"
                              placeholder="Digite a senha"
                              invalid={!!formState.errors.password}
                              {...register("password", {
                                // trim password on change
                                onChange: (e) => {
                                  e.target.value = e.target.value.trim();

                                  return e;
                                },
                              })}
                            />

                            {!formState.errors.password && (
                              <button
                                className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                                type="button"
                                id="password-addon"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                <i className="ri-eye-fill align-middle"></i>
                              </button>
                            )}
                          </div>
                          {formState.errors.password && (
                            <FormFeedback type="invalid" className="d-block">
                              {formState.errors.password?.message}
                            </FormFeedback>
                          )}
                        </div>

                        <div className="mt-4">
                          <Button
                            color="success"
                            className="btn btn-success w-100"
                            type="submit"
                          >
                            {formState.isSubmitting ? (
                              <span className="d-flex align-items-center justify-content-center">
                                <Spinner
                                  size="sm"
                                  className="flex-shrink-0"
                                  role="status"
                                >
                                  Entrando...
                                </Spinner>
                                <span className="ms-2">Entrando...</span>
                              </span>
                            ) : (
                              "Entrar"
                            )}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </ParticlesAuth>
    </>
  );
};

export const getServerSideProps = withSSRGuest(async () => {
  return {
    props: {},
  };
});

export default Login;
