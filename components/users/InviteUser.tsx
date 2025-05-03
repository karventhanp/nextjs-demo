import { useEffect, useState } from "react";
import Image from "next/image";
import { StepperButtons } from "@/types/button";
import { StepperButton } from "../common/Buttons";
import { CustomerProps } from "@/types/customer";
import { UserData } from "@/types/user";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { Role, RoleClass, Roles, UserRole } from "@/types/roles";
import Table from "../common/Table";
import { StatusClass, TableContent, TableRow } from "@/types/common";
import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "@/utils/utils";
import { updateStepperButtons, getCustomerId } from "@/helpers/helper";

const InviteUser: React.FC<CustomerProps> = ({ callback = () => {} }) => {
  const [buttons, setButtons] = useState<StepperButtons>({
    cancel: {
      loading: false,
      disabled: true,
      label: "Cancel",
      name: "cancel",
    },
    skip: { loading: false, disabled: false, label: "Skip", name: "skip" },
    submit: {
      loading: false,
      disabled: false,
      label: "Submit",
      name: "submit",
    },
  });
  const [users, setUsers] = useState<UserData[]>([]);
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const { setShowOffCanvas, setOffCanvasType, isUserAdded, setIsUserInvite, setIsUserAdded, setIsCustomerOnboarding } =
    useAppContext();
  const router = useRouter();
  const [tableContent, setTableContent] = useState<TableRow[]>([]);

  const invite = () => {
    setIsUserInvite(true);
    setOffCanvasType("user");
    setShowOffCanvas(true);
  };

  const getInvitedUsers = async () => {
    const customerId = getCustomerId();
    if (customerId) {
      const response = await authService.getUsersByCustomer(customerId);
      if (response.status === 200) {
        setUsers(response.data);
      }
    }
  };

  const getAssignedRoles = async () => {
    let roles: Role[] = [];
    if (users.length > 0) {
      for (let i = 0; i < users.length; i++) {
        const response = await authService.getUserRoles(users[i].id);
        if (response.status === 200) {
          const userRolesWithId = response.data.map((role: Role) => ({
            ...role,
            userId: users[i].id,
          }));
          roles = [...roles, ...userRolesWithId];
        }
      }
    }
    setUserRoles(roles);
  };

  const processUsersToShow = () => {
    const content: TableRow[] = users.map((user) => ({
      id: user.id,
      contents: [
        { name: `${user.firstName} ${user.lastName}`, className: "col-span-3" },
        { name: user.email, className: "col-span-3" },
        {
          name: Array.isArray(user.attributes["phoneNumber"])
            ? user.attributes["phoneNumber"].join(", ")
            : user.attributes["phoneNumber"] || "N/A",
          className: "col-span-2",
        },
        {
          name:
            userRoles.find((role) => role.userId === user.id)?.name ===
            UserRole.FSA
              ? "User"
              : Roles[
                  userRoles.find((role) => role.userId === user.id)
                    ?.name as UserRole
                ].label,
          className: "col-span-2",
          tagClassName:
            RoleClass[
              userRoles.find((role) => role.userId === user.id)?.name ?? ""
            ],
        },
        {
          name: user.enabled ? "Active" : "Inactive",
          className: "col-span-2",
          tagClassName: user.enabled
            ? StatusClass["ACTIVE"]
            : StatusClass["INACTIVE"],
        },
      ],
    }));
    setTableContent(content);
  };

  const handleSubmit = () => {
    setIsCustomerOnboarding(false);
    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "submit", values: { disabled: true, loading: true } },
      ])
    );
    removeLocalStorage("COMSTE");
    const existingId = getLocalStorage("TEMP_CUSID");
    setLocalStorage("CUSID", existingId);
    removeLocalStorage("TEMP_CUSID");
    router.push("/customers");
    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "submit", values: { disabled: false, loading: false } },
      ])
    );
  };

  useEffect(() => {
    processUsersToShow();
  }, [userRoles]);

  useEffect(() => {
    getAssignedRoles();
  }, [users]);

  useEffect(() => {
    isUserAdded && getInvitedUsers();
  }, [isUserAdded]);

  useEffect(() => {
    getInvitedUsers();
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-between gap-4 w-full">
        <h5 className="text-smokyBlack text-base font-medium">Invite Users</h5>
        <button
          className="flex gap-2 items-center justify-center p-2.5 border border-platinum rounded-2xl text-primary font-medium text-sm"
          onClick={() => invite()}
        >
          <Image
            src="/images/rounded-plus-primary.svg"
            width={20}
            height={20}
            alt="Plus"
          />
          <span>Invite User</span>
        </button>
      </div>
      <div className="w-full h-full flex justify-center items-center">
        {users.length > 0 && tableContent ? (
          <div className="w-full h-full">
            <Table
              removePagination={true}
              headers={[
                { name: "User Name", className: "col-span-3" },
                { name: "Email Address", className: "col-span-3" },
                { name: "Contact Number", className: "col-span-2" },
                { name: "Role", className: "col-span-2", tag: true },
                { name: "Status", className: "col-span-2", tag: true },
              ]}
              contents={tableContent}
            />
          </div>
        ) : (
          <div className="text-sm text-liver font-normal text-center h-40 flex justify-center items-center">
            Please click Invite User button to onboard users
          </div>
        )}
      </div>
      <div className="flex justify-end gap-4">
        {buttons.cancel && (
          <StepperButton data={buttons.cancel} onClick={() => {}} />
        )}
        {users.length === 0 && buttons.skip && (
          <StepperButton
            data={buttons.skip}
            onClick={() => {
              router.push("/customers");
            }}
          />
        )}
        {users.length !== 0 && buttons.submit && (
          <StepperButton data={buttons.submit} onClick={handleSubmit} />
        )}
      </div>
    </div>
  );
};

export default InviteUser;
