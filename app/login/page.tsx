"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";

const Login: React.FC = () => {
  useEffect(() => {
    signIn("keycloak", { callbackUrl: process.env.NEXT_PUBLIC_LOGIN_CALLBACK });
  }, []);

  return <></>;
};

export default Login;