"use client";

import { SessionProvider } from "next-auth/react";
import { AppProvider, useAppContext } from "@/context/AppContext";
import SideMenu from "./SideMenu";
import Navbar from "./Navbar";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import Loader from "./common/Loader";
import { checkUserHasAccess, logout } from "@/helpers/helper";
import PopupWrapper from "./popup/PopupWrapper";
import useClickOutside from "@/hooks/useClickOutside";
import ProgressStatus from "./common/ProgressStatus";
import { usePathname, useRouter } from "next/navigation";
import OffCanvasWrapper from "./canvas/OffCanvasWrapper";
import { useScreenWidth } from "@/hooks/useScreenWidth";
import OptimizedOffCanvasWrapper from "./canvas/OptimizedOffCanvasWrapper";
import OptimizedPopupWrapper from "./popup/OptimizedPopupWrapper";
import BottomNavbar from "./BottomNavbar";
import { UserRole } from "@/types/roles";

const MainWrapperContent = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const { data: session, status } = useSession();
  const {
    showSideMenu,
    setShowSideMenu,
    showSideMenuDesktop,
    allowedActions,
    isLogoutInitiated,
    setIsLogoutInitiated,
    organization,
    setSideMenuRef,
    userRole,
    isCustomerView,
    customerName,
    assignedCustomers,
  } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);
  const sideRef = useRef<HTMLDivElement>(null);
  const path = usePathname();
  const router = useRouter();
  const screenWidth: number = useScreenWidth();

  const handleSignOut = async () => {
    setIsLogoutInitiated(true);
    if (!(await logout(session?.id_token)))
      console.error("An error occurred during logout.");
  };

  useEffect(() => {
    if (session && session.error) {
      handleSignOut();
    }
  }, [session]);

  useEffect(() => {
    if (status !== "loading") {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (organization && allowedActions && path) {
      setHasAccess(
        checkUserHasAccess(organization, allowedActions, path, userRole)
      );
    }
  }, [organization, allowedActions, path]);

  useEffect(() => {
    if (sideRef.current) setSideMenuRef(sideRef.current);
  }, [sideRef.current, showSideMenu]);

  useClickOutside([sideRef], () => setShowSideMenu(false));

  if (isLoading || isLogoutInitiated) {
    return (
      <div className="h-screen flex items-center justify-center w-full">
        <Loader />
      </div>
    );
  }

  return (
    <>
      {session ? (
        <>
          {hasAccess ? (
            <>
              <div className={`flex bg-whiteSmoke p-4 h-screen gap-4`}>
                {(userRole === UserRole.FSA &&
                  !organization?.customer_view &&
                  (!assignedCustomers || assignedCustomers.length === 0)) || (
                  <div
                    ref={sideRef}
                    className={`fixed lg:static transition-all transform ease-in-out duration-300 bg-snow rounded-3xl p-4 
                 flex flex-col justify-between shadow-medium lg:shadow-none gap-4 h-full
                ${
                  showSideMenu || (showSideMenuDesktop && screenWidth > 1023)
                    ? "opacity-100 scale-100 pointer-events-auto min-w-60 max-w-60 flex z-20 !h-[calc(100vh-32px)]"
                    : "opacity-0 scale-95 pointer-events-none min-w-20 max-w-20"
                }
                lg:opacity-100 lg:scale-100 lg:pointer-events-auto`}
                  >
                    <SideMenu />
                  </div>
                )}
                <div className="main flex flex-col overflow-y-scroll scrollbar-none w-full">
                  {(userRole === UserRole.FSA &&
                    !organization?.customer_view &&
                    (!assignedCustomers || assignedCustomers.length === 0)) || (
                    <div className="nav bg-whiteSmoke pb-4">
                      <Navbar />
                    </div>
                  )}
                  <div
                    className={`content overflow-y-auto overflow-visible scrollbar-none w-full mt-1 h-full ${
                      !isCustomerView && customerName && "mb-12 sm:mb-0"
                    }`}
                  >
                    {children}
                  </div>
                </div>
              </div>
              <PopupWrapper />
              <OptimizedPopupWrapper />
              <ProgressStatus />
              <OffCanvasWrapper />
              <OptimizedOffCanvasWrapper />
              {!isCustomerView && customerName && customerName != "" && (
                <BottomNavbar />
              )}
            </>
          ) : (
            <div className="w-full h-screen flex justify-center items-center bg-platinum">
              <div className="bg-snow w-100 p-4 h-fit rounded-2xl shadow-medium flex gap-2 flex-col">
                <h5 className="text-smokyBlack font-medium text-base">
                  Access Denied
                </h5>
                <p className="text-liver text-sm font-normal">
                  Please contact the administrator or the appropriate authority
                  for assistance.
                </p>
                <div className="w-full flex justify-end gap-2 items-end pt-6">
                  <button
                    className="px-3 py-2 rounded-lg text-smokyBlack text-sm border border-platinum font-medium flex items-center"
                    onClick={() => router.back()}
                  >
                    Back
                  </button>
                  <button
                    className="px-3 py-2 bg-primary border border-primary rounded-lg text-snow text-sm font-medium flex items-center"
                    onClick={handleSignOut}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div>{children}</div>
      )}
    </>
  );
};

const MainWrapper = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <SessionProvider>
      <AppProvider>
        <MainWrapperContent>{children}</MainWrapperContent>
      </AppProvider>
    </SessionProvider>
  );
};

export default MainWrapper;
