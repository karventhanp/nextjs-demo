"use client";

import { ActionButton, StepperButton } from "@/components/common/Buttons";
import { IconBox } from "@/components/common/IconBox";
import TabSwitcher from "@/components/common/TabSwitcher";
import CompanyDetails from "@/components/customers/CompanyDetails";
import Zone from "@/components/customers/Zone";
import PocInfo from "@/components/users/PocInfo";
import UsersTable from "@/components/users/UsersTable";
import { useAppContext } from "@/context/AppContext";
import { authService } from "@/services/authService";
import { inspectionService } from "@/services/inspectionService";
import { ActionButtons, StepperButtons } from "@/types/button";
import { TabSwitcherData } from "@/types/common";
import { Customer } from "@/types/customer";
import { Zones } from "@/types/inpection";
import { Role, UserRole } from "@/types/roles";
import { UserData } from "@/types/user";
import { useEffect, useState } from "react";

const CustomerSettings = () => {
  const [tabs, setTabs] = useState<TabSwitcherData>({
    active: 1,
    tabs: [
      { id: 1, label: "Details", disabled: false },
      { id: 2, label: "Zones", disabled: false },
      { id: 3, label: "Users", disabled: false },
    ],
  });
  const {
    customerId,
    setOffCanvasType,
    setShowOffCanvas,
    isUserAdded,
    setIsUserInvite,
    fetchZones,
  } = useAppContext();
  const [settingsData, setSettingsData] = useState<Customer>();
  const [users, setUsers] = useState<UserData[]>([]);
  const [actions, setActions] = useState<ActionButtons>({
    edit: {
      disabled: false,
      icon: "edit.svg",
      label: "Edit",
      loading: false,
      name: "edit",
    },
  });
  const [edit, setEdit] = useState<boolean>(false);
  const [zones, setZones] = useState<Zones>([]);
  const [buttons, setButtons] = useState<StepperButtons>({
    invite: {
      loading: false,
      disabled: false,
      label: "Invite User",
      name: "invite",
    },
  });
  const [loading, setLoading] = useState<{
    user: boolean;
    customer: boolean;
    zone: boolean;
  }>({ user: true, customer: true, zone: true });

  const handleTabSwitch = (id: number) => {
    setTabs((prev) => ({ ...prev, active: id }));
  };

  const getCustomer = async () => {
    if (customerId) {
      const response = await authService.getCustomerById(customerId);
      if (response.status === 200) {
        setSettingsData(response.data);
      }
    }
  };

  const getRole = async (userId: string) => {
    const response = await authService.getUserRoles(userId);
    if (response.status === 200) {
      const role: Role = response.data[0];
      return role;
    }
  };

  const getUsers = async () => {
    setLoading((prev) => ({ ...prev, user: true }));
    if (customerId) {
      const response = await authService.getUsersByCustomer(customerId);
      if (response.status === 200) {
        const usersData: UserData[] = response.data;
        for (let i = 0; i < usersData.length; i++) {
          const role: Role | undefined = (await getRole(usersData[i].id)) as
            | Role
            | undefined;
          if (role) {
            usersData[i] = {
              ...usersData[i],
              roleId: role.id,
              role: role.name as UserRole,
            };
          }
        }
        setUsers(usersData);
      }
    }
    setLoading((prev) => ({ ...prev, user: false }));
  };

  const getZones = async () => {
    const response = await inspectionService.getZones(customerId);
    if (response.status === 200) {
      setZones(response.data.zones);
    }
  };

  const inviteUser = () => {
    setIsUserInvite(true);
    setOffCanvasType("user");
    setShowOffCanvas(true);
  };

  useEffect(() => {
    isUserAdded && getUsers();
  }, [isUserAdded]);

  useEffect(() => {
    setActions((prev) => ({
      ...prev,
      edit: {
        ...(prev.edit || {}),
        label: edit ? "Disable" : "Edit",
        loading: prev.edit?.loading ?? false,
        disabled: prev.edit?.disabled ?? false,
        name: prev.edit?.name ?? "edit",
        icon: prev.edit?.icon ?? "edit.svg",
      },
    }));
  }, [edit]);

  useEffect(() => {
    getCustomer();
    getUsers();
    getZones();
    return () => {
      fetchZones();
    }
  }, []);

  return (
    <div className="rounded-2xl p-4 bg-snow w-full flex flex-col gap-4 h-full">
      <div className="flex gap-4 items-center">
        <IconBox
          action="back"
          icon="left-arrow.svg"
          className="!bg-ghostWhite !rounded-2xl p-2.5 border-platinum border"
        />
        <h5 className="font-medium text-smokyBlack text-[15px]">Settings</h5>
      </div>
      <div className="w-full flex gap-4 justify-between items-center">
        <TabSwitcher
          data={tabs}
          withNormalButton={false}
          switchTab={(id) => handleTabSwitch(id)}
        />
        {actions.edit && tabs.active === 1 && (
          <ActionButton data={actions.edit} onClick={() => setEdit(!edit)} />
        )}
        {buttons.invite && tabs.active === 3 && (
          <StepperButton data={buttons.invite} onClick={inviteUser} />
        )}
      </div>
      <div className="w-full overflow-y-auto h-full scrollbar-none flex flex-col gap-4">
        {tabs.active === 1 && (
          <>
            <CompanyDetails
              viewFlow={true}
              viewData={settingsData}
              canEdit={edit}
              callback={() => setEdit(false)}
            />
            <>
              {users.map(
                (user, index) =>
                  user.role === UserRole.ADMIN &&
                  user.attributes?.["owner"]?.[0] == "true" && (
                    <PocInfo
                      key={index}
                      viewFlow={true}
                      viewData={user}
                      canEdit={edit}
                      callback={() => {
                        setEdit(false);
                        getUsers();
                      }}
                    />
                  )
              )}
            </>
          </>
        )}
        {tabs.active === 2 && (
          <Zone
            viewFlow={true}
            viewData={zones}
            callback={() => getZones()}
            canEdit={edit}
          />
        )}
        {tabs.active === 3 && (
          <UsersTable viewFlow={true} viewData={users} loading={loading.user} />
        )}
      </div>
    </div>
  );
};

export default CustomerSettings;
