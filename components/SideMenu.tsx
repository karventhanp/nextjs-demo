"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { usePathname, useRouter } from "next/navigation";
import { assetService } from "@/services/assetService";
import { signOut, useSession } from "next-auth/react";
import axios from "axios";
import { getAdminMenus, getCustomerMenus, getLogoName } from "@/helpers/helper";
import { Roles, UserRole } from "@/types/roles";
import { Option } from "@/types/input";
import OptimizedDropDown from "./common/OptimizedDropDown";
import { removeLocalStorage } from "@/utils/utils";
import Constants from "@/constants/constants";

const SideMenu = () => {
  const { data: session } = useSession();
  const path = usePathname();
  const router = useRouter();
  const {
    setShowSideMenu,
    showSideMenuDesktop,
    setShowSideMenuDesktop,
    organization,
    setIsLogoutInitiated,
    userRole,
    isSideBarNavigation,
    setSideBarNavigation,
    isNavbarNavigation,
    menuItems,
    setMenuItems,
    setCustomerName,
    setCustomerId,
    isCustomerView,
    isMenuItemActive,
    customerName,
  } = useAppContext();
  const [usage, setUsage] = useState<string>("");
  const [settings, setSettings] = useState<Option[]>([
    {
      label: "Account Settings",
      name: "settings",
      value: "settings",
      icon: "settings.svg",
    },
    {
      label: "Logout",
      name: "logout",
      value: "logout",
      icon: "logout.svg",
      className: "text-carminePink",
    },
  ]);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [initial, setInitial] = useState<boolean>(true);

  const handleLinkChange = () => {
    setShowSideMenu(false);
    if (menuItems.length > 0) {
      setMenuItems(
        menuItems.map((item) => ({
          ...item,
          active: isMenuItemActive(item, path),
        }))
      );
    }
  };

  const handleCustomerSession = () => {
    setCustomerName(undefined);
    removeLocalStorage(Constants.CUSTOMER_ID);
    setCustomerId("");
  };

  const getStorageUsage = async () => {
    const response = await assetService.getStorageUsage();
    if (response.status === 200) {
      setUsage(response.data.totalUsage ? response.data.totalUsage : "0.0 KB");
    } else {
      setUsage("0.0 KB");
    }
  };

  const logout = async () => {
    setIsLogoutInitiated(true);
    await axios.get(`/api/auth/logout?id_token_hint=${session?.id_token}`);
    await signOut();
  };

  const handleSettings = (key: string, value: string) => {
    if (value === "settings") {
      router.push("/user/settings");
    }
    if (value === "logout") {
      logout();
    }
  };

  const sidebarClickHandle = () => {
    setSideBarNavigation(true);
    if (!isCustomerView) {
      handleCustomerSession();
    }
  };

  useEffect(() => {
    if (organization && isSideBarNavigation) {
      const basePath = "/" + path.split("/")[1];
      const newMenus = organization.customer_view
        ? getCustomerMenus()
        : getAdminMenus();
      const menus = newMenus.map((item) => ({
        ...item,
        active: basePath === item.path,
      }));
      setMenuItems(menus);
    }
  }, [organization]);

  useEffect(() => {
    if (customerName) {
      getStorageUsage();
    }
    if (organization) {
      const basePath = "/" + path.split("/")[1];
      const newMenus = organization.customer_view
        ? getCustomerMenus()
        : getAdminMenus();
      const menus = newMenus.map((item) => ({
        ...item,
        active: basePath === item.path,
      }));
      setMenuItems(menus);
    }
  }, []);

  useEffect(() => {
    if (initial && menuItems.length > 0) {
      handleLinkChange();
      setInitial(false);
    }
  }, [menuItems]);

  useEffect(() => {
    if (isSideBarNavigation) {
      if (!isCustomerView) {
        handleCustomerSession();
      }
      setSideBarNavigation(false);
      handleLinkChange();
    }
  }, [path, organization]);

  useEffect(() => {
    if (isNavbarNavigation) {
      setMenuItems(
        menuItems.map((item) => ({
          ...item,
          active: false,
        }))
      );
    }
  }, [isNavbarNavigation]);

  return (
    <>
      <div className="flex flex-col">
        <div className="w-full h-12 flex justify-between items-center">
          <Image
            src="/images/swasth.svg"
            width={120}
            height={22.47}
            alt="Logo"
            className="cursor-pointer"
          />
          <div
            className={`bg-snow rounded-2xl p-2 cursor-pointer ${
              !showSideMenuDesktop && "lg:hidden"
            }`}
            onClick={() => {
              setShowSideMenu(false);
              setShowSideMenuDesktop(false);
            }}
          >
            <Image
              src="/images/collapse-icon.svg"
              width={24}
              height={24}
              alt="Expand Icon"
            />
          </div>
        </div>
        <div className="pt-8 gap-4 flex flex-col">
          {menuItems.map((item, index) => (
            <Link
              href={item.path}
              key={index}
              onClick={() => {
                sidebarClickHandle();
                handleLinkChange();
              }}
              className={`flex items-center rounded-2xl py-3 px-4 gap-4 transition-all duration-300 ease-in-out hover:scale-95 ${
                item.active
                  ? "bg-gradient-to-r from-pineGreen to-secondary"
                  : "bg-transparent "
              } ${showSideMenuDesktop ? "" : "justify-center hover:!scale-90"}`}
            >
              <Image
                src={`/images/${
                  item.active ? item.iconActivePath : item.iconPath
                }`}
                width={24}
                height={24}
                alt={item.name}
                className={`${!showSideMenuDesktop && "lg:min-w-6 lg:min-h-6"}`}
              />
              <span
                className={`font-medium text-sm ${
                  item.active ? "text-snow" : "text-liver"
                } ${showSideMenuDesktop ? "" : "lg:hidden"}`}
              >
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {session && session.user && (
          <div
            className={`flex justify-between transition-all duration-300 ease-in-out ${
              !showSideMenuDesktop && "lg:!border-none lg:!p-0"
            } border bg-snow border-platinum p-2 rounded-2xl cursor-pointer relative`}
            onClick={() => setShowSettings(true)}
          >
            <div className="flex gap-2 items-center">
              <div
                className={`w-10.5 lg:w-[48px] ${
                  !showSideMenuDesktop && "lg:!h-[48px]"
                } h-full flex justify-center items-center bg-whiteSmoke rounded-full text-sm font-semibold text-regentGrey`}
              >
                {getLogoName(session.user.name ?? "")}
              </div>
              <div
                className={`flex flex-col ${
                  !showSideMenuDesktop && "lg:hidden"
                }`}
              >
                <span className="font-normal text-sm text-liver">
                  Hello, {session.user.name}
                </span>
                <span className="font-medium text-sm text-smokyBlack">
                  {userRole ? Roles[userRole as UserRole].label : "No Role"}
                </span>
              </div>
            </div>
            <div
              className={`flex justify-center items-center ${
                !showSideMenuDesktop && "lg:hidden"
              }`}
            >
              <Image
                src="/images/selector.svg"
                width={24}
                height={24}
                alt="Down Icon"
              />
            </div>
            <OptimizedDropDown
              show={showSettings}
              setShow={setShowSettings}
              onChange={handleSettings}
              options={settings}
              showAbove={true}
              showSplitter={true}
              fillContainer={true}
            />
          </div>
        )}

        {customerName && (
          <div
            className={`flex justify-between border bg-ghostWhite border-platinum p-4 rounded-2xl items-center transition-all duration-300 ease-in-out ${
              !showSideMenuDesktop &&
              "w-11.25 h-11.25 !justify-center !items-center !text-center !bg-white"
            }`}
          >
            <label
              className={`font-medium text-base text-smokyBlack ${
                !showSideMenuDesktop && ""
              }`}
            >
              {showSideMenuDesktop && usage}
              <span
                className={` hidden ${
                  !showSideMenuDesktop &&
                  "!flex !whitespace-nowrap !text-[10px]"
                }`}
              >
                {usage.toLocaleLowerCase().includes("byte") ||
                usage.toLocaleLowerCase().includes("bytes")
                  ? usage.slice(0, 3)
                  : usage}
              </span>
              <span
                className={`font-normal text-xs pl-1 ${
                  !showSideMenuDesktop && "lg:hidden"
                }`}
              >
                Stored
              </span>
            </label>
            <Image
              src="/images/cloud.svg"
              width={30}
              height={24}
              alt="Storage Icon"
              className={`${!showSideMenuDesktop && "hidden"}`}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default SideMenu;
