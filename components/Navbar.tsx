"use client";

import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { signOut, useSession } from "next-auth/react";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Option } from "@/types/input";
import OptimizedDropDown from "./common/OptimizedDropDown";
import { UserRole } from "@/types/roles";
import { usePathname, useRouter } from "next/navigation";
import NotificationPopup from "./popup/components/NotificationPopup";
import useClickOutside from "@/hooks/useClickOutside";
import {
  getAdminMenus,
  getCustomerId,
  getCustomerMenus,
  getLogoName,
} from "@/helpers/helper";
import { authService } from "@/services/authService";
import Link from "next/link";
import { useScreenWidth } from "@/hooks/useScreenWidth";
import { notificationService } from "@/services/notificationService";
import { inspectionService } from "@/services/inspectionService";
import { NotificationItem } from "@/types/notification";

const Navbar = () => {
  const { data: session } = useSession();
  const {
    setShowSideMenu,
    setIsLogoutInitiated,
    setShowPopup,
    setPopupType,
    setCustomerId,
    customers,
    customerName,
    userRole,
    isCustomerView,
    setShowOffCanvas,
    setOffCanvasType,
    setIsUserInvite,
    setIsCustomerOnboarding,
    showSideMenuDesktop,
    setShowSideMenuDesktop,
    organization,
    isNavbarNavigation,
    setIsNavbarNavigation,
    adminMenuItems,
    setAdminMenuItems,
    isMenuItemActive,
    userId,
    setNotifications,
    notifications,
  } = useAppContext();
  const popupRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const path = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [width, setWidth] = useState({ collapsed: 0, expanded: 0 });
  const [settings, setSettings] = useState<Option[]>([]);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState(false);
  const [name, setName] = useState<string>();
  const [logo, setLogo] = useState<string>();
  const screenWidth = useScreenWidth();
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [inspectionNames, setInspectionNames] = useState<{
    [key: string]: string;
  }>({});

  const getOptimizedName = (
    name: string | undefined,
    truncate: boolean
  ): string => {
    if (!name) return "";
    return truncate ? name.split(" ")[0] : name;
  };

  const getSettings = () => {
    const cusId = getCustomerId();
    let options: Option[] = [];
    if (!isCustomerView && userRole === UserRole.SUPER_ADMIN) {
      options.push({
        label: "Search Customer",
        name: "search",
        value: "search",
        icon: "search-icon.svg",
      });
    }

    if (
      cusId &&
      (userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN)
    ) {
      options.push({
        label: "Settings",
        name: "settings",
        value: "settings",
        icon: "settings.svg",
      });
    }
    if (userRole === UserRole.ADMIN && isCustomerView) {
      options.push({
        label: "Invite User",
        name: "invite",
        value: "invite",
        icon: "rounded-plus-primary.svg",
        className: "text-primary",
      });
    } else if (!isCustomerView && userRole === UserRole.SUPER_ADMIN) {
      options.push({
        label: "Onboard New Customer",
        name: "onboard",
        value: "onboard",
        icon: "rounded-plus-primary.svg",
        className: "text-primary",
      });
    }
    setSettings(options);
  };

  const getCustomerLogo = async () => {
    const cusId = getCustomerId();
    if (cusId) {
      const response = await authService.getCustomerLogo(cusId);
      if (response.status === 200) {
        setLogo(URL.createObjectURL(response.data));
      }
    }
  };

  const handleLinkChange = () => {
    setShowSideMenu(false);
    if (adminMenuItems.length > 0) {
      setAdminMenuItems(
        adminMenuItems.map((item) => ({
          ...item,
          active: isMenuItemActive(item, path),
        }))
      );
    }
  };

  const handleSettingsAction = (action: string) => {
    if (action === "settings") {
      const id = getCustomerId();
      if (id) {
        setCustomerId(id);
        router.push(`/customer-settings`);
      }
    }
    if (action === "search") {
      setPopupType("search");
      setShowPopup(true);
    }
    if (action === "invite") {
      setIsUserInvite(true);
      setOffCanvasType("user");
      setShowOffCanvas(true);
    }
    if (action === "onboard") {
      setIsCustomerOnboarding(true);
      router.push("/customers/create");
    }
  };

  const handleMouseEvent = (expand: boolean) => {
    if (customerName?.toLowerCase() !== "solinas") {
      setIsExpanded(expand);
      setName(getOptimizedName(customerName, !expand));
    }
  };

  const handleBellIcon = async () => {
    setShowNotification(!showNotification);
    if (userId) {
    const { data } = await notificationService.getAllNotifications(userId);

    if (data) {
      setNotifications({
        items: data,
        unreadCount: data.filter((item: NotificationItem) => !item.read).length,
      });
    }}
  };

  useEffect(() => {
    URL.revokeObjectURL(logo ?? "");
    setLogo(undefined);
    getCustomerLogo();
    setName(getOptimizedName(customerName, true));
    if (nameRef.current) {
      const tempDiv = document.createElement("div");
      tempDiv.style.visibility = "hidden";
      tempDiv.style.position = "absolute";
      tempDiv.style.whiteSpace = "nowrap";
      tempDiv.className = "text-sm";
      document.body.appendChild(tempDiv);
      tempDiv.textContent = customerName
        ? getOptimizedName(customerName, true)
        : "Select Customer";
      const collapsedWidth = tempDiv.offsetWidth;

      tempDiv.textContent = customerName
        ? getOptimizedName(customerName, false)
        : "Select Customer";
      const expandedWidth = tempDiv.offsetWidth;

      document.body.removeChild(tempDiv);

      setWidth({
        collapsed: collapsedWidth,
        expanded: expandedWidth,
      });
    }
  }, [customerName]);

  useEffect(() => {
    getCustomerLogo();
  }, [customers]);

  useEffect(() => {
    getSettings();
  }, [isCustomerView, customerName]);

  useEffect(() => {
    return () => {
      if (logo) {
        setLogo(undefined);
        URL.revokeObjectURL(logo);
      }
    };
  }, []);

  useEffect(() => {
    const fetchInspectionNames = async () => {
      const uniqueIds = notifications.items
        .filter((n) => n.notificationType === "comment")
        .map((n) => n.identifierId);

      const names: { [key: string]: string } = {};

      await Promise.all(
        uniqueIds.map(async (id) => {
          if (id && !inspectionNames[id]) {
            const { data } = await inspectionService.getInspectionById(id);
            names[id] = data?.siteName || "Unknown Site Name";
          }
        })
      );

      setInspectionNames((prev) => ({ ...prev, ...names }));
    };

    fetchInspectionNames();
  }, [notifications?.items]);

  useEffect(() => {
    if (notifications.unreadCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [notifications.unreadCount]);

  useEffect(() => {
      if (organization) {
        const menus = !organization.customer_view
          ? getCustomerMenus()
          : getAdminMenus();
        setAdminMenuItems(menus);
      }
  }, [organization]);

  useEffect(() => {
    if (isNavbarNavigation) {
      setShowSideMenuDesktop(false);
    }
    setIsNavbarNavigation(false);
    handleLinkChange();
  }, [path, organization]);

  useClickOutside([popupRef], () => setShowNotification(false));

  return (
    <div
      className={`flex justify-between ${
        !showSideMenuDesktop && "lg:!justify-between"
      } gap-2 sm:gap-4 h-11 items-center w-full pt-2 relative`}
    >
      <div className="flex gap-4">
        <Image
          src="/images/swasth.svg"
          width={120}
          height={44}
          alt="Swasth Logo"
          className="hidden md:block w-auto h-auto lg:hidden"
        />
        <div
          className={`bg-snow rounded-2xl p-2 cursor-pointer lg:hidden ${
            !showSideMenuDesktop && "lg:!flex"
          }`}
          onClick={() => {
            setShowSideMenu(true);
            setShowSideMenuDesktop(true);
          }}
        >
          <Image
            src="/images/expand-icon.svg"
            width={24}
            height={24}
            alt="Expand Icon"
            className="!w-7 !h-7 sm:!w-6 sm:!h-6"
          />
        </div>
        {!isCustomerView && name && (
          <div className="hidden sm:flex gap-4 bg-white rounded-2xl items-center min-h-11 max-h-11 box-border px-1 pt-0">
            {adminMenuItems.map((item, index) => {
              return (
                <Link
                  href={item.path}
                  key={index}
                  onClick={() => {
                    setIsNavbarNavigation(true);
                    handleLinkChange();
                  }}
                  className={`flex items-center px-3 lg:px-6 py-2 gap-3 rounded-xl transition-all duration-300 ease-in-out
                    ${
                      item.active
                        ? "bg-pineGreen/10 text-pineGreen shadow-sm ring-1 ring-pineGreen"
                        : "text-liver hover:bg-ghostWhite"
                    }`}
                >
                  <Image
                    src={`/images/${
                      item.active ? item.iconPath : item.iconPath
                    }`}
                    width={20}
                    height={20}
                    alt={item.name}
                  />
                  <span
                    className={`font-medium text-xs whitespace-nowrap ${
                      item.active ? "text-liver" : "text-liver"
                    } hidden lg:flex `}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <div className={`flex ${screenWidth < 340 ? "gap-1" : "gap-4"} relative`}>
        <div
          className={`w-11 h-11 flex justify-center items-center bg-snow rounded-2xl cursor-pointer ${!showNotification && "relative"}`}
          onClick={(e) => {
            e.stopPropagation();
            handleBellIcon();
          }}
        >
          <Image
            src="/images/bell-icon.svg"
            width={24}
            height={24}
            alt="Bell Icon"
            className={`${isAnimating && "animate-bounce"} transition-all duration-300`}
          />
          {notifications.unreadCount >= 1 && !showNotification && (
            <span className="absolute bg-primary rounded-full w-2 h-2 top-0 right-0"></span>
          )}
          {showNotification && (
            <NotificationPopup
              popupRef={popupRef}
              isVisible={showNotification}
              inspectionNames={inspectionNames}
              setInspectionNames={setInspectionNames}
              onClose={() => setShowNotification(false)}
            />
          )}
        </div>

        <div
          className={`w-11 h-11 flex justify-center items-center rounded-2xl cursor-pointer ${
            customerName ? "bg-primary text-snow font-bold" : "bg-snow"
          }`}
          onClick={() => {}}
        >
          {!customerName ? (
            <Image
              src="/images/category.svg"
              width={24}
              height={24}
              alt="Switch Product"
            />
          ) : (
            "IN"
          )}
        </div>
        <div
          className="flex items-center gap-2 bg-snow rounded-2xl h-11 w-36 sm:w-auto"
          onClick={() => setShowSettings(true)}
        >
          <div className="h-full bg-transparent flex rounded-l-2xl p-0.5">
            {logo ? (
              <Image
                src={logo}
                width={45}
                height={20}
                className="rounded-2xl"
                alt="Customer Logo"
              />
            ) : (
              <div className="w-11.25 min-w-11.25 h-full flex justify-center items-center font-semibold text-regentGrey bg-ghostWhite rounded-2xl">
                {getLogoName(customerName ?? "S C")}
              </div>
            )}
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer py-3 pr-2"
            onMouseOver={() => handleMouseEvent(true)}
            onMouseLeave={() => handleMouseEvent(false)}
          >
            <div
              ref={nameRef}
              style={{
                width:
                  !isCustomerView && screenWidth < 640
                    ? "4rem"
                    : isExpanded
                    ? `${width.expanded}px`
                    : `${width.collapsed}px`,
              }}
              className={`overflow-hidden transform transition-all duration-300
                w-fit ease-in-out whitespace-nowrap`}
            >
              <span className="text-smokyBlack font-normal text-sm hidden sm:flex">
                {name ? name : "Select customer"}
              </span>
              <span className="text-smokyBlack font-normal text-sm sm:hidden">
                {name ? name : "Select"}
              </span>
            </div>
            <Image
              src="/images/tabler-icon.svg"
              width={24}
              height={24}
              alt="Tabler Icon"
            />
          </div>
        </div>
        <OptimizedDropDown
          options={settings}
          setShow={setShowSettings}
          onChange={(_, action) => handleSettingsAction(action)}
          show={showSettings}
          showSplitter={true}
          position="right"
          fitContainer={true}
        />
      </div>
    </div>
  );
};

export default Navbar;
