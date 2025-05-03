"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { AppState } from "@/types/app-state";
import { InspectionData } from "@/types/inpection";
import { OffCanvasTypes, PopupTypes, ModalContent } from "@/types/common";
import { sseService } from "@/services/sseService";
import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "@/utils/utils";
import { VideoQueueData } from "@/types/inpection";
import {
  checkAllVideosCompleted,
  formatCustomerName,
  getAllowedActions,
  getCustomerId,
  getSolinas,
  handleBackgroundProcess,
  processCustomers,
  setCustomerInStorage,
  validCustomerPath,
  validInspectionPath,
} from "@/helpers/helper";
import { signIn, useSession } from "next-auth/react";
import { OrganizationInfo } from "@/types/auth";
import { AllowedActions, Role, UserRole } from "@/types/roles";
import { Customer } from "@/types/customer";
import { authService } from "@/services/authService";
import { UserData } from "@/types/user";
import { inspectionService } from "@/services/inspectionService";
import { Option } from "@/types/input";
import Constants from "@/constants/constants";
import { UploadProgress } from "@/types/service";
import { MenuItem } from "@/types/menu";
import { AssignedCustomers } from "@/types/auth";
import Loader from "@/components/common/Loader";
import { notificationService } from "@/services/notificationService";
import {
  NotificationItem,
  NotificationResponse,
  NotificationState,
} from "@/types/notification";

const AppContext = createContext<AppState | undefined>(undefined);

const AppProvider = ({ children }: { children: ReactNode }) => {
  const [showSideMenu, setShowSideMenu] = useState<boolean>(false);
  const [showSideMenuDesktop, setShowSideMenuDesktop] = useState<boolean>(true);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [showProgressStatus, setShowProgressStatus] = useState<{
    full: boolean;
    half: boolean;
  }>({ full: false, half: false });
  const [inspectionId, setInspectionId] = useState<string>("");
  const [inspectionData, setInspectionData] = useState<InspectionData[]>([]);
  const [popupType, setPopupType] = useState<PopupTypes>();
  const [storedQueue, setStoredQueue] = useState<VideoQueueData[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const { data: session } = useSession();
  const [userId, setUserId] = useState<string>("");
  const [organization, setOrganization] = useState<OrganizationInfo>();
  const [allowedActions, setAllowedActions] = useState<AllowedActions>({
    view: false,
    create: false,
    edit: false,
    delete: false,
    download: false,
    fsa_management: false,
    user_management: false,
  });
  const [isLogoutInitiated, setIsLogoutInitiated] = useState<boolean>(false);
  const [showOffCanvas, setShowOffCanvas] = useState<boolean>(false);
  const [offCanvasType, setOffCanvasType] = useState<OffCanvasTypes>();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isCustomerUser, setIsCustomerUser] = useState<boolean>(true);
  const [assignedCustomers, setAssignedCustomers] = useState<
    AssignedCustomers[] | null
  >(null);
  const [userRole, setUserRole] = useState<UserRole>();
  const [isCustomerView, setIsCustomerView] = useState<boolean>(true);
  const [customerId, setCustomerId] = useState<string>();
  const [customerName, setCustomerName] = useState<string | undefined>();
  const [isUserAdded, setIsUserAdded] = useState<boolean>(false);
  const [canvaUser, setCanvaUser] = useState<UserData>();
  const [isUserInvite, setIsUserInvite] = useState<boolean>(false);
  const [clientRoles, setClientRoles] = useState<Role[]>([]);
  const [isCustomerOnboarding, setIsCustomerOnboarding] =
    useState<boolean>(false);
  const [zone, setZone] = useState<Option[]>([]);
  const [solinasId, setSolinasId] = useState<string>();
  const activeConnections = useRef(new Set<string>());
  const [optimizedOffCanvasContent, setOptimizedOffCanvasContent] =
    useState<ModalContent>();
  const [showOptimizedOffCanvas, setShowOptimizedOffCanvas] =
    useState<boolean>(false);
  const [optimizedPopupContent, setOptimizedPopupContent] =
    useState<ModalContent>();
  const [showOptimizedPopup, setShowOptimizedPopup] = useState<boolean>(false);
  const [sideMenuRef, setSideMenuRef] = useState<HTMLDivElement | null>(null);
  const [activeTimeStamp, setActiveTimeStamp] = useState<string>();
  const [isSideBarNavigation, setSideBarNavigation] = useState<boolean>(false);
  const [isNavbarNavigation, setIsNavbarNavigation] = useState<boolean>(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [adminMenuItems, setAdminMenuItems] = useState<MenuItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationState>({
    items: [],
    unreadCount: 0,
  });
  const [isViewCommentsClicked, setIsViewCommentsClicked] =
    useState<boolean>(false);
  const [newWindow, setNewWindow] = useState<{
    active: number[];
    clicked: boolean;
  }>({
    active: [0],
    clicked: false,
  });
  const [showSideBar, setShowSideBar] = useState<boolean>(false);
  const [sideBar, setSideBar] = useState<{
    active: number[];
    tabs: { icon: string; activeIcon: string }[];
  }>({
    active: [1, 2, 3, 4],
    tabs: [
      { icon: "component-black.svg", activeIcon: "component.svg" },
      { icon: "video.svg", activeIcon: "video-white.svg" },
      { icon: "image-black.svg", activeIcon: "image-white.svg" },
      { icon: "notepad.svg", activeIcon: "notepad-white.svg" },
    ],
  });

  const handleTabSwitch = () => {
    setIsViewCommentsClicked(!isViewCommentsClicked);
  };

  const getCustomers = async () => {
    const response = await authService.getCustomers({ max: 500 });
    if (response.status === 200) {
      setSolinasId(getSolinas(response.data)?.id);
      setCustomers(processCustomers(response.data));
    }
  };

  const isMenuItemActive = (item: MenuItem, currentPath: string): boolean => {
    return (
      currentPath === item.path ||
      (item.subPaths ?? []).some(
        (subPath) =>
          currentPath === `${item.path}${subPath}` ||
          currentPath.startsWith(`${item.path}${subPath}/`)
      ) ||
      (item.activePaths ?? []).some((activePath) =>
        currentPath.startsWith(activePath)
      ) ||
      (item.path === "/inspections" && validInspectionPath(currentPath)) ||
      (item.path === "/customers" && validCustomerPath(currentPath))
    );
  };

  const handleSideBar = (id: number | number[]) => {
    setSideBar((prev: any) => {
      if (Array.isArray(id)) {
        return {
          ...prev,
          active: id,
        };
      }
      const newActiveItems = prev.active.includes(id)
        ? prev.active.filter((item: number) => item !== id)
        : [...prev.active, id];

      return {
        ...prev,
        active: newActiveItems.length > 0 ? newActiveItems : [0],
      };
    });
  };

  const handleNewWindow = (action: { type: "open" | "close"; id: number }) => {
    setNewWindow((prev: any) => {
      if (action.id === -1) return { active: [], clicked: false };

      const currentActive = Array.isArray(prev.active) ? prev.active : [];
      if (action.type === "open") {
        return {
          ...prev,
          active: [...new Set([...currentActive, action.id])],
          clicked: true,
        };
      }

      if (action.type === "close") {
        const newActive = currentActive.filter(
          (item: number) => item !== action.id
        );
        return {
          ...prev,
          active: newActive.length > 0 ? newActive : [0],
          clicked: newActive.length > 0,
        };
      }

      return prev;
    });
  };

  const fetchZones = async () => {
    try {
      const custId = getCustomerId();
      const fetchedZones = custId && (await inspectionService.getZones(custId));
      const formattedZones =
        fetchedZones &&
        fetchedZones.data?.zones?.map((zone: string) => ({
          label: zone.charAt(0).toUpperCase() + zone.slice(1),
          value: zone.toLowerCase(),
          name: zone.charAt(0).toUpperCase() + zone.slice(1),
        }));
      setZone(formattedZones);
    } catch (err) {
      console.error("Error fetching zones", err);
    }
  };

  useEffect(() => {
    setIsCustomerUser(true);
    setIsUserAdded(false);
    setIsUserInvite(false);
  }, [customerId]);

  useEffect(() => {
    if (session) {
      if (session.organization) {
        setOrganization(session.organization);
      }
      if (session.sub) {
        setUserId(session.sub);
      }
      if (session.assignedCustomers) {
        setAssignedCustomers(session.assignedCustomers);
      }
      if (session.user && session.organization && session.user.roles) {
        setUserRole(session.user.roles[0]);
        setAllowedActions(
          getAllowedActions(
            session.user.roles,
            session.organization.customer_view
          )
        );
      }
    }
  }, [session]);

  const handleProgress = (data: UploadProgress, queue: VideoQueueData) => {
    const progress = handleBackgroundProcess(data, queue, userId);
    if (progress) {
      setStoredQueue(progress);
    }
  };

  const getAllNotifications = async () => {
    const response = await notificationService.getAllNotifications(userId);

    if (response.status === 200 && Array.isArray(response.data)) {
      setNotifications({
        items: response.data,
        unreadCount: response.data.filter(
          (item: NotificationItem) => !item.read
        ).length,
      });
    }
  };

  useEffect(() => {
    const allProgress: VideoQueueData[] = JSON.parse(
      getLocalStorage("progress") ?? "[]"
    );
    if (allProgress.length > 0) {
      const userProgress = allProgress.filter(
        (progress) => progress.userId === userId && progress.percent !== 100
      );

      const remainingProgress = allProgress.filter(
        (queue: VideoQueueData) => queue.percent !== 100
      );
      if (remainingProgress.length > 0) {
        setLocalStorage("progress", JSON.stringify(remainingProgress));
      } else {
        removeLocalStorage("progress");
      }
      setStoredQueue(userProgress);
    } else {
      removeLocalStorage("progress");
    }

    if (userId) {
      getAllNotifications();
      sseService.getNotifications(userId, (data: NotificationResponse) => {
        if (data.notification) {
          // Add new notification
          setNotifications((prev) => ({
            items: data.notification
              ? [data.notification, ...prev.items]
              : prev.items,
            unreadCount: data.unreadCount,
          }));
        } else if (data.unreadCount !== undefined) {
          // Update only unread count
          setNotifications((prev) => ({
            ...prev,
            unreadCount: data.unreadCount,
          }));
        }
      });
    }
  }, [userId]);

  useEffect(() => {
    if (storedQueue.length === 0) return;

    if (!checkAllVideosCompleted(storedQueue)) {
      setShowProgressStatus({ full: false, half: true });
    }
    storedQueue.forEach((video) => {
      if (
        video.percent === 100 ||
        !video.uploadId ||
        activeConnections.current.has(video.uploadId)
      )
        return;
      activeConnections.current.add(video.uploadId);
      sseService.getUploadProgress(video.uploadId, (data) =>
        handleProgress(data, video)
      );
    });
  }, [storedQueue.length]);

  useEffect(() => {
    if (organization) {
      if (organization.customer_view) {
        setIsCustomerView(true);
        setCustomerInStorage(organization.id, organization.name);
        setCustomerId(organization.id);
        setCustomerName(formatCustomerName(organization.name));
      } else {
        if (
          !(
            userRole === UserRole.FSA &&
            (!assignedCustomers || assignedCustomers.length === 0)
          )
        ) {
          getCustomers();
        }
        setIsCustomerView(false);
        removeLocalStorage(Constants.CUSTOMER_ID);
        removeLocalStorage(Constants.CUSTOMER_NAME);
        removeLocalStorage(Constants.TEMPORARY_CUSTOMER_ID);
      }
    }
  }, [organization?.customer_view]);

  useEffect(() => {
    if (session === null) {
      signIn("keycloak", {
        callbackUrl: process.env.NEXT_PUBLIC_LOGIN_CALLBACK,
      });
    }
  }, [session]);

  useEffect(() => {
    if (customerName) fetchZones();
  }, []);

  return (
    <AppContext.Provider
      value={{
        showSideMenu,
        setShowSideMenu,
        showPopup,
        setShowPopup,
        inspectionId,
        setInspectionId,
        inspectionData,
        setInspectionData,
        popupType,
        setPopupType,
        storedQueue,
        setStoredQueue,
        assignedCustomers,
        setAssignedCustomers,
        showProgressStatus,
        setShowProgressStatus,
        imageUrl,
        setImageUrl,
        userId,
        setUserId,
        organization,
        setOrganization,
        allowedActions,
        setAllowedActions,
        isLogoutInitiated,
        setIsLogoutInitiated,
        showOffCanvas,
        setShowOffCanvas,
        offCanvasType,
        setOffCanvasType,
        customers,
        setCustomers,
        isCustomerUser,
        setIsCustomerUser,
        userRole,
        setUserRole,
        isCustomerView,
        setIsCustomerView,
        customerId,
        setCustomerId,
        customerName,
        setCustomerName,
        isUserAdded,
        setIsUserAdded,
        canvaUser,
        setCanvaUser,
        isUserInvite,
        setIsUserInvite,
        clientRoles,
        setClientRoles,
        isCustomerOnboarding,
        setIsCustomerOnboarding,
        zone,
        setZone,
        fetchZones,
        solinasId,
        setSolinasId,
        showSideMenuDesktop,
        setShowSideMenuDesktop,
        showOptimizedOffCanvas,
        setShowOptimizedOffCanvas,
        optimizedOffCanvasContent,
        setOptimizedOffCanvasContent,
        showOptimizedPopup,
        setShowOptimizedPopup,
        optimizedPopupContent,
        setOptimizedPopupContent,
        sideMenuRef,
        setSideMenuRef,
        activeTimeStamp,
        setActiveTimeStamp,
        isSideBarNavigation,
        setSideBarNavigation,
        isNavbarNavigation,
        setIsNavbarNavigation,
        menuItems,
        setMenuItems,
        adminMenuItems,
        setAdminMenuItems,
        isMenuItemActive,
        setNotifications,
        notifications,
        isViewCommentsClicked,
        handleTabSwitch,
        sideBar,
        setSideBar,
        handleSideBar,
        newWindow,
        setNewWindow,
        handleNewWindow,
        showSideBar,
        setShowSideBar,
      }}
    >
      {session ? (
        children
      ) : (
        <div className="h-screen flex items-center justify-center w-full">
          <Loader />
        </div>
      )}
    </AppContext.Provider>
  );
};

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export { AppProvider, useAppContext };
