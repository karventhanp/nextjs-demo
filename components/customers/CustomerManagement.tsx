import { useEffect, useState } from "react";
import { SearchInput } from "../common/Inputs";
import { SearchInputForm } from "@/types/input";
import CustomersTable from "./CustomersTable";
import { useAppContext } from "@/context/AppContext";
import { Customer } from "@/types/customer";
import { formatCustomerName } from "@/helpers/helper";
import { StepperButtons } from "@/types/button";
import { StepperButton } from "../common/Buttons";
import { useRouter } from "next/navigation";

const CustomerManagement = () => {
  const [search, setSearch] = useState<SearchInputForm>({
    name: "customers",
    value: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const { customers, setIsCustomerOnboarding } = useAppContext();
  const [customerData, setCustomerData] = useState<Customer[]>([]);
  const [buttons, setButtons] = useState<StepperButtons>({
    invite: {
      loading: false,
      disabled: false,
      label: "Onboard New Customer",
      name: "invite",
    },
  });
  const router = useRouter();

  const searchCustomers = () => {
    setLoading(true);
    if (search) {
      const filteredCustomers = customers.filter((customer) =>
        formatCustomerName(customer.name)
          .toLowerCase()
          .includes(search.value.toLowerCase())
      );
      setCustomerData(filteredCustomers);
    } else {
      setCustomerData(customers);
    }
    setLoading(false);
  };

  const handleSearch = (value: string) => {
    setSearch((prev) => ({ ...prev, value }));
  };

  const handleCustomerInvite = () => {
    setIsCustomerOnboarding(true);
    router.push("/customers/create");
  };

  useEffect(() => {
    searchCustomers();
  }, [search]);

  useEffect(() => {
    if (customers) {
      setCustomerData(customers);
    }
  }, [customers]);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex w-full gap-4 flex-wrap md:flex-nowrap">
        <div className="w-full">
          <SearchInput props={search} onChange={handleSearch} />
        </div>
        <div className="w-fit min-w-fit">
          {buttons.invite && (
            <StepperButton
              data={buttons.invite}
              onClick={handleCustomerInvite}
            />
          )}
        </div>
      </div>
      <div className="w-full h-full overflow-y-auto scrollbar-none">
        <CustomersTable viewData={customerData} loading={loading} />
      </div>
    </div>
  );
};

export default CustomerManagement;
