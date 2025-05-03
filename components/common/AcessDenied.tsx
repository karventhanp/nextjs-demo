import React, { useEffect } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import { signOut, useSession } from "next-auth/react";
const AccessDenied = () => {
  const { data: session } = useSession();
  const { setIsLogoutInitiated } = useAppContext();

  const logout = async () => {
    setIsLogoutInitiated(true);
    await axios.get(`/api/auth/logout?id_token_hint=${session?.id_token}`);
    await signOut();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 p-5 ">
      <div className="bg-ghostWhite p-8  w-135 h-112.5 sm:h-90.75  rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="flex justify-center">
            <Image
              src="/images/access-denied.svg"
              width={140}
              height={140}
              alt="access-denied"
            />
          </div>
          <p className="text-xl text-smokyBlack font-medium ">
            Access Denied, Admin Permission Required
          </p>
          <p className="text-sm text-liver text-left">
            you don’t have access to this page yet. Please contact your admin to
            enable access for your account.
          </p>
          <div className="py-3">
            <button
              className="text-carminePink text-sm flex items-center gap-2 border border-platinum w-fit rounded-xl px-4 py-2"
              onClick={logout}
            >
              <Image
                src="/images/logout.svg"
                width={24}
                height={24}
                alt="logout"
              />
              Logout
            </button>
          </div>
          <p className="text-smokyBlack text-sm font-medium flex flex-col sm:flex-row  sm:gap-2 ">
            For assistance, contact{" "}
            <a className="text-royalBlue text-sm">
              {" "}
              support-swasth@solinas.in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
