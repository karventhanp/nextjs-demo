"use client";

import Loader from "@/components/common/Loader";
import AdminDashBoard from "@/components/dashboard/AdminDashBoard";
import CustomerDashBoard from "@/components/dashboard/CustomerDashBoard";
import { useAppContext } from "@/context/AppContext";
import { useEffect, useState } from "react";
import { UserRole } from "@/types/roles";
import AccessDenied from "@/components/common/AcessDenied";

const Home = () => {
  const { organization, userRole, assignedCustomers } = useAppContext();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    organization ? setLoading(false) : setLoading(true);
  }, [organization]);

  return (
    <div className="w-full h-full rounded-2xl">
      {loading ? (
        <div className="h-full bg-snow rounded-2xl border flex items-center justify-center border-snow">
          <Loader />
        </div>
      ) : userRole === UserRole.FSA &&
        !organization?.customer_view &&
        (!assignedCustomers || assignedCustomers.length === 0) ? (
        <AccessDenied />
      ) : organization?.customer_view ? (
        <CustomerDashBoard />
      ) : (
        <CustomerDashBoard />
        //Admin Dashboard
      )}
    </div>
  );
};

export default Home;
