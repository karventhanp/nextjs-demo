"use client";

import { IconBox } from "@/components/common/IconBox";
import { Input, TelInput } from "@/components/common/Inputs";
import { authService } from "@/services/authService";
import { Field } from "@/types/input";
import { UserData } from "@/types/user";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface UserSettingsForm {
  firstName: Field<string>;
  lastName: Field<string>;
  mailAddress: Field<string>;
  contactNumber: Field<string>;
}

const UserSettings = () => {
  const [form, setForm] = useState<UserSettingsForm>({
    firstName: {
      name: "firstName",
      error: null,
      label: "First Name",
      required: false,
      value: "",
    },
    lastName: {
      name: "lastName",
      error: null,
      label: "Last Name",
      required: false,
      value: "",
    },
    mailAddress: {
      name: "mailAddress",
      error: null,
      label: "Email Address",
      required: false,
      value: "",
    },
    contactNumber: {
      name: "contactNumber",
      error: null,
      label: "Contact Number",
      required: false,
      value: "",
    },
  });
  const { data: session } = useSession();
  const [user, setUser] = useState<UserData>();

  const getUserData = async () => {
    if (session && session.sub) {
      const response = await authService.getUserById(session.sub);
      if (response.status === 200) {
        setUser(response.data);
      }
    }
  };

  useEffect(() => {
    const phoneNumber = user?.attributes?.phoneNumber?.[0] || "";
    setForm((prev) => ({
      ...prev,
      firstName: { ...prev.firstName, value: user?.firstName || "" },
      lastName: { ...prev.lastName, value: user?.lastName || "" },
      mailAddress: { ...prev.mailAddress, value: user?.email || "" },
      contactNumber: {
        ...prev.contactNumber,
        value: phoneNumber,
      },
    }));
  }, [user]);

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <div className="bg-snow rounded-2xl h-full w-full p-4 flex flex-col gap-4">
      <div className="w-full flex gap-4 items-center md:w-1/2">
        <IconBox
          action="back"
          icon="left-arrow.svg"
          className="!bg-ghostWhite !rounded-2xl p-2.5 border-platinum border"
        />
        <h5 className="text-sm text-smokyBlack font-medium">
          Account Settings
        </h5>
      </div>
      <div className="w-full h-auto border border-platinum p-4 rounded-2xl flex flex-col gap-4">
        <h5 className="text-liver text-sm font-medium">Personal Information</h5>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex gap-4 w-full flex-wrap md:flex-nowrap">
            <Input props={{ ...form.firstName, readonly: true }} />
            <Input props={{ ...form.lastName, readonly: true }} />
          </div>
          <Input props={{ ...form.mailAddress, readonly: true }} />
          <TelInput
            props={{ ...form.contactNumber, readonly: true }}
            defaultCountry="IN"
          />
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
