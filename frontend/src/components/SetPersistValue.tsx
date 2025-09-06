// components/PersistWrapper.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/Api/store";
import { setPersist } from "@/Api/slices/CredentialsSlice";
import load_local_storage_data from "@/helpers/get_local_storage.data";

interface PersistWrapperProps {
  children: ReactNode;
}

const PersistWrapper: React.FC<PersistWrapperProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
 
  useEffect(() => {
    const persisted = load_local_storage_data("persist", false);
    dispatch(setPersist(persisted));
  }, [dispatch]);

  return <>{children}</>;
};

export default PersistWrapper;
