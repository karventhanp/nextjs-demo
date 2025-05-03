import { useEffect, useState } from "react";
import Table from "../common/Table";
import { StatusClass, TableRow } from "@/types/common";
import { Customer, CustomerProps } from "@/types/customer";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

const CustomersTable: React.FC<CustomerProps> = ({ loading, viewData }) => {
  const [tableContent, setTableContent] = useState<TableRow[]>([]);
  const { setCustomerId } = useAppContext();
  const router = useRouter();

  const processToShowCustomers = () => {
    const customers = viewData as Customer[];
    if (customers) {
      const content: TableRow[] = customers.map((customer) => ({
        id: customer.id,
        contents: [
          {
            name: customer.name,
            className: "col-span-3",
          },
          {
            name: customer.attributes?.["mailAddress"]?.[0],
            className: "col-span-3",
          },
          {
            name: customer.attributes?.["phoneNumber"]?.[0],
            className: "col-span-2",
          },
          {
            name: customer.attributes?.["products"],
            className: "col-span-2",
            tagClassName: "py-1 px-2 rounded-xl bg-ghostWhite text-liver"
          },
          {
            name: customer.enabled ? "Active" : "Inactive",
            className: "col-span-1",
            tagClassName: customer.enabled
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
    }
  };

  const handleCustomer = (id: string) => {
    setCustomerId(id);
    router.push(`/customers/${id}`);
  };

  useEffect(() => {
    processToShowCustomers();
  }, [viewData]);

  return (
    <div className="w-full h-full">
      <Table
        headers={[
          { name: "Customer Name", className: "col-span-3" },
          { name: "Email Address", className: "col-span-3" },
          { name: "Contact Number", className: "col-span-2" },
          { name: "Products", className: "col-span-2" },
          { name: "Status", className: "col-span-1", tag: true },
          { name: "", className: "col-span-1" },
        ]}
        contents={tableContent}
        loading={loading}
        onClick={handleCustomer}
      />
    </div>
  );
};

export default CustomersTable;
