import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, store } from "./store";
import { logout_user, refresh_token } from "./slices/CredentialsSlice";
import { useRouter } from "next/navigation";
import { axiosPrivate } from "./api";

interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshResponse {
  accessToken: string;
  data: any;
  isLoggedIn: boolean;
  msg: string;
  componentType: string;
}

let refreshPromise: Promise<RefreshResponse> | null = null;

const useAxiosPrivate = (): AxiosInstance => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const axiosPrivateRef = useRef<AxiosInstance>(axiosPrivate);

  useEffect(() => {
    const axiosInstance = axiosPrivateRef.current;

    // Request interceptor: attach access token
    const requestIntercept = axiosInstance.interceptors.request.use(
      (config) => {
        const token = store.getState().credential.accessToken;
        if (token && config.headers) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: handle 401
    const responseIntercept = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const prevRequest = error.config as AxiosRequestConfigWithRetry;

        if (error.response?.status === 401 && !prevRequest._retry && prevRequest.url !== "refreshToken") {
          prevRequest._retry = true;

          if (!refreshPromise) {
            refreshPromise = dispatch(refresh_token({ axiosInstance, componentType: "refresh_token" }))
              .unwrap()
              .finally(() => {
                refreshPromise = null;
              });
          }

          try {
            const refreshResponse = await refreshPromise;
            const newAccessToken = refreshResponse?.accessToken;

            if (prevRequest.headers) {
              prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            }

            return axiosInstance(prevRequest);
          } catch (refreshError) {
            dispatch(logout_user({ componentType: "logout_user" }));
            router.replace("/login"); // replace is better than push here
            return Promise.reject(refreshError);
          }
        }

        // Not a 401 → just reject, don't logout
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestIntercept);
      axiosInstance.interceptors.response.eject(responseIntercept);
    };
  }, []);

  return axiosPrivateRef.current;
};

export default useAxiosPrivate;
