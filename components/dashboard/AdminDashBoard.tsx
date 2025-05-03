"use client";

import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";

const AdminDashBoard = () => {
  const router = useRouter();
  return (
    <div className="w-full h-full flex  justify-center items-center bg-snow rounded-2xl p-4">
      Admin DashBoard
    </div>
  );
};

export default AdminDashBoard;
