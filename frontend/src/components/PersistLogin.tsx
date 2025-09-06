"use client";

import { useEffect, useState, ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, LoadingOverlay } from "@mantine/core";
import { AppDispatch } from "@/Api/store";
import useAxiosPrivate from "@/Api/useAxiosPrivate";
import { refresh_token, logout_user, selectCredentialState } from "@/Api/slices/CredentialsSlice";


interface PersistLoginProps {
  children: ReactNode;
}

const PersistLogin: React.FC<PersistLoginProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { accessToken, persist } = useSelector(selectCredentialState);
  const dispatch = useDispatch<AppDispatch>();
  const axiosInstance = useAxiosPrivate();


  useEffect(() => {
    let isMounted = true;

    const verifyToken = async () => {
      try {
        // If we have persist but no accessToken, try refresh
        if (!accessToken) {
           await dispatch(refresh_token({ axiosInstance, componentType: "refresh_token_persist" }));
        }
        // // If persist is false, logout immediately
        // if (!persist) {
        //   dispatch(logout_user({ axiosInstance, componentType: "logout_user_persist_false" }));
        //   return;
        // }
      } catch (err) {
        console.error(err);
        dispatch(logout_user({  componentType: "logout_user_refresh_fail" }));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [accessToken, persist, dispatch, axiosInstance]);

  return (
    <Box pos="relative" style={{ minHeight: "100vh" }}>
      <LoadingOverlay visible={isLoading} overlayProps={{ radius: "sm", blur: 2 }} loaderProps={{ color: "#228ae6", type: "bars" }} zIndex={1000} />
      {!isLoading && children}
    </Box>
  );
};

export default PersistLogin;
