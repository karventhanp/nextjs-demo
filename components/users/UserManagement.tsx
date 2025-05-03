import { SearchInputForm } from "@/types/input";
import { StepperButton } from "../common/Buttons";
import { SearchInput } from "../common/Inputs";
import { useEffect, useState } from "react";
import UsersTable from "./UsersTable";
import { authService } from "@/services/authService";
import { UserData } from "@/types/user";
import { useAppContext } from "@/context/AppContext";

const UserManagement = () => {
  const [search, setSearch] = useState<SearchInputForm>({
    name: "users",
    value: "",
  });
  const [solinasUsers, setSolinasUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const { setIsCustomerUser, isUserAdded } = useAppContext();
  const [loading, setLoading] = useState<boolean>(true);

  const getSolinasFSAUsers = async () => {
    setLoading(true);
    const response = await authService.getFsaUsers();
    if (response.status === 200) {
      setSolinasUsers(response.data);
      setFilteredUsers(response.data);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    if (search.value !== "") {
      setFilteredUsers(
        solinasUsers.filter((user) =>
          (user.firstName + " " + user.lastName)
            .toLowerCase()
            .includes(search.value.trim().toLowerCase())
        )
      );
    } else {
      setFilteredUsers(solinasUsers);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [search]);

  useEffect(() => {
    isUserAdded && getSolinasFSAUsers();
  }, [isUserAdded])

  useEffect(() => {
    setIsCustomerUser(false);
    getSolinasFSAUsers();
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="w-full">
        <SearchInput
          props={search}
          onChange={(value) => setSearch((prev) => ({ ...prev, value }))}
        />
      </div>
      <div className="w-full h-full overflow-y-auto scrollbar-none">
        <UsersTable viewData={filteredUsers} loading={loading} />
      </div>
    </div>
  );
};

export default UserManagement;
