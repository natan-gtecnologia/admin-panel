import Router from "next/router";
import { destroyCookie, parseCookies, setCookie } from "nookies";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { ICompany } from "../../@types/company";
import { api } from "../../services/apiClient";

type AuthProviderProps = {
  children: ReactNode;
};

interface SignInData {
  usernameOrEmail: string;
  password: string;
  rememberMe?: boolean;
}

interface UserAuth {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  jwt: string;
  companies: ICompany[];
  permissions?: any[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => void;
  user: UserAuth | null;
}

let authChannel: BroadcastChannel;

export function signOut() {
  authChannel.postMessage("signOut");

  destroyCookie(undefined, "@Admin:token");
  destroyCookie(undefined, "@Admin:user");
  destroyCookie(undefined, "@Admin:configPanel");

  api.defaults.headers["Authorization"] = ``;

  Router.push("/login");
}

export const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserAuth | null>(null);
  const isAuthenticated = !!user;

  async function loadMe(token?: string, maxAge: number = 0) {
    try {
      const cacheToken = parseCookies(undefined)["@Admin:token"];
      if (cacheToken || token) {
        const response = await api.get("/users/me", {
          params: {
            populate: ["companies", "companies.metaData", "role"],
          },
          headers: {
            Authorization: `Bearer ${cacheToken || token}`,
          },
        });

        const responsePermission = await api.get(`access-controls`, {
          params: {
            populate: "*",
          },
          headers: {
            Authorization: `Bearer ${cacheToken || token}`,
          },
        });

        if (response.data.id) {
          setUser({
            jwt: cacheToken,
            permissions: responsePermission.data.data,
            ...response.data,
          });
        }

        setCookie(undefined, "@Admin:user", JSON.stringify(response.data), {
          maxAge: maxAge, // 30 days or 1 day
          path: "/",
        });

        (
          api.defaults.headers as unknown as {
            Authorization: string;
          }
        )["Authorization"] = `Bearer ${cacheToken || token}`;
      }
    } catch {
      signOut();
    }
  }

  async function signIn({ usernameOrEmail, password, rememberMe }: SignInData) {
    const { data } = await api.post("/auth/local", {
      identifier: usernameOrEmail,
      password: password,
    });
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days or 1 day

    setCookie(undefined, "@Admin:token", data.jwt, {
      maxAge: maxAge, // 30 days or 1 day
      path: "/",
    });

    (
      api.defaults.headers as unknown as {
        Authorization: string;
      }
    )["Authorization"] = `Bearer ${data.jwt}`;

    if (authChannel) {
      authChannel.postMessage("signIn");
    }

    loadMe(data.jwt, maxAge);

    await Router.push("/");
  }

  useEffect(() => {
    authChannel = new BroadcastChannel("auth");

    authChannel.onmessage = (message) => {
      switch (message.data) {
        case "signOut":
          Router.push("/login");
          break;
        case "signIn":
          Router.push("/");
          break;
        default:
          break;
      }
    };

    loadMe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        signIn,
        user,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  //if (!context) {
  //  throw new Error('useAuth must be used within an AuthProvider');
  //}

  return context;
};
