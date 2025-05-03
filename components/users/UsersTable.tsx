import {
  StatusClass,
  TableContent,
  TableHeader,
  TableRow,
} from "@/types/common";

import { useEffect, useState } from "react";
import Table from "../common/Table";
import { CustomerProps } from "@/types/customer";
import { UserData } from "@/types/user";
import { RoleClass, Roles, UserRole } from "@/types/roles";
import { useAppContext } from "@/context/AppContext";
import { formatCustomerName } from "@/helpers/helper";

const UsersTable: React.FC<CustomerProps> = ({
  callback = () => {},
  viewFlow,
  viewData,
  canEdit,
  loading,
}) => {
  const [tableContent, setTableContent] = useState<TableRow[]>([]);
  const [headers, setHeaders] = useState<TableHeader[]>([]);
  const {
    isCustomerUser,
    setCanvaUser,
    setShowOffCanvas,
    setOffCanvasType,
    setIsUserInvite,
  } = useAppContext();

  const processUsersToShow = () => {
    const users = viewData as UserData[];
    const content: TableRow[] = users.map((user) => ({
      id: user.id,
      contents: isCustomerUser
        ? [
            {
              name: `${user.firstName} ${user.lastName}`,
              className: "col-span-3",
            },
            { name: user.email, className: "col-span-3" },
            {
              name: Array.isArray(user.attributes["phoneNumber"])
                ? user.attributes["phoneNumber"].join(", ")
                : user.attributes["phoneNumber"] || "N/A",
              className: "col-span-2",
            },
            {
              name: [
                user.role === UserRole.FSA ? "User" : Roles[user.role]?.label,
                user.attributes["owner"]?.includes("true") ? "Poc" : "",
              ],
              className: "col-span-2",
              tagClassName: RoleClass[user.role],
            },
            {
              name: user.enabled ? "Active" : "Inactive",
              className: "col-span-1",
              tagClassName: user.enabled
                ? StatusClass["ACTIVE"]
                : StatusClass["INACTIVE"],
            },
            {
              name: "",
              className: "col-span-1",
              icon: "chevron-down-icon.svg",
            },
          ]
        : [
            {
              name: `${user.firstName} ${user.lastName}`,
              className: "col-span-4",
            },
            { name: user.email, className: "col-span-3" },
            {
              name: user.attributes?.["ASSIGNED_PRODUCTS"],
              className: "col-span-2",
              tagClassName: "py-1 px-2 rounded-xl bg-ghostWhite text-liver",
            },
            {
              name: user.enabled ? "Active" : "Inactive",
              className: "col-span-2",
              tagClassName: user.enabled
                ? StatusClass["ACTIVE"]
                : StatusClass["INACTIVE"],
            },
            {
              name: "",
              className: "col-span-1",
              icon: "chevron-down-icon.svg",
            },
          ],
    }));
    setTableContent(content);
  };

  const handleUser = (id: string) => {
    const users = viewData as UserData[];
    const user: UserData | undefined = users.find((user) => user.id === id);
    if (user) {
      setIsUserInvite(false);
      setCanvaUser(user);
      isCustomerUser ? setOffCanvasType("user") : setOffCanvasType("solinas");
      setShowOffCanvas(true);
    }
  };

  useEffect(() => {
    isCustomerUser
      ? setHeaders([
          { name: "User Name", className: "col-span-3" },
          { name: "Email Address", className: "col-span-3" },
          { name: "Contact Number", className: "col-span-2" },
          { name: "Role", className: "col-span-2", tag: true },
          { name: "Status", className: "col-span-1", tag: true },
          { name: "", className: "col-span-1" },
        ])
      : setHeaders([
          { name: "User Name", className: "col-span-4" },
          { name: "Email Address", className: "col-span-3" },
          { name: "Products", className: "col-span-2" },
          { name: "Status", className: "col-span-2", tag: true },
          { name: "", className: "col-span-1" },
        ]);
  }, [isCustomerUser]);

  useEffect(() => {
    processUsersToShow();
  }, [viewData]);

  return (
    <div className="w-full h-full">
      <Table
        headers={headers}
        contents={tableContent}
        loading={loading}
        onClick={handleUser}
      />
    </div>
  );
};

export default UsersTable;
