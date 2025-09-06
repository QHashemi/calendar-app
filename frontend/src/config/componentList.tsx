"use client";
import React, { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { get_components, selectComponents } from "@/Api/slices/ComponentsSlice";
import { selectCredentialState } from "@/Api/slices/CredentialsSlice";
import useAxiosPrivate from "@/Api/useAxiosPrivate";
import { AppDispatch } from "@/Api/store";
import NoPermission from "@components/NoPermission";

interface Props {
  componentName: string;
  component?: React.ReactNode
}


export default function ReturnComponent({ componentName, component }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const axiosInstance = useAxiosPrivate();
  const { accessToken, user } = useSelector(selectCredentialState);

  useEffect(() => {
    if (accessToken) {
      dispatch(get_components({ axiosInstance, componentType: "get_components" }));
    }
  }, [dispatch, axiosInstance, accessToken]);

  const components = useSelector(selectComponents);

  // Find the component from Redux
  const found = components.find(
    (c) => c.name.toLowerCase() === componentName.toLowerCase()
  );

  if (!found) return <></>; // ⬅️ If component is not registered, deny access

  // Check if user has at least one matching role
  const hasRole = user.roles.some((userRole) =>
    found.roles.some((componentRole) => componentRole.id === userRole.id)
  );

  // Check if user has at least one matching permission
  const hasPermission = found.permissions.some((per) =>
    user.roles.some((role) =>
      role.permissions.some((uPerm) => uPerm.id === per.id)
    )
  );

  // ⬅️ If neither role nor permission matches → block
  if (!hasRole && !hasPermission) return<></>;

  // ✅ Otherwise render the component
  return <>{component}</>;
}
