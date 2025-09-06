"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCredentialState } from "@/Api/slices/CredentialsSlice";

interface RequireAuthProps {
  allowedRoles: string[];
  children: ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ allowedRoles, children }) => {
  const { user, isLoggedIn } = useSelector(selectCredentialState);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rolesLoaded = user && Array.isArray(user.roles);
  const hasAccess = rolesLoaded
    ? user.roles.some((role) => allowedRoles.includes(role.name))
    : false;

  useEffect(() => {
    if (!isLoggedIn) {
      const from = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
      router.replace(`/login?from=${encodeURIComponent(from)}`);
    } else if (rolesLoaded && allowedRoles.length > 0 && !hasAccess) {
      router.replace("/unauthorized");
    }
  }, [isLoggedIn, rolesLoaded, hasAccess, allowedRoles, pathname, searchParams, router]);

  if (!isLoggedIn || !rolesLoaded) return null;
  return hasAccess ? <>{children}</> : null;
};

export default RequireAuth;
