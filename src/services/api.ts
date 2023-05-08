import axios, { AxiosError } from 'axios';
import { parseCookies } from 'nookies';
import { signOut } from '../contexts/AuthContext/index';
import { AuthTokenError } from '../utils/AuthTokenError';

export function setupAPIClient(ctx = undefined) {
  const cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: cookies['@Admin:configPanel'],
    headers: {
      ...(cookies['@Admin:token'] && {
        Authorization: `Bearer ${cookies['@Admin:token']}`,
      }),
    },
    withCredentials: true,
  });

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        if (error.response.data?.code === 'UnauthorizedError') {
          //alert(error.response.data?.message);
        }
        if (process.browser) {
          signOut();
        } else {
          return Promise.reject(new AuthTokenError());
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
}
