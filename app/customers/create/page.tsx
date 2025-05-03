"use client";

import { IconBox } from "@/components/common/IconBox";
import Stepper from "@/components/common/Stepper";
import { useState } from "react";
import { StepperSteps } from "@/types/common";
import CompanyInfo from "@/components/customers/CompanyInfo";
import { getLocalStorage, setLocalStorage } from "@/utils/utils";
import Zone from "@/components/customers/Zone";
import InviteUser from "@/components/users/InviteUser";

const CreateCustomer = () => {
  const [completed, setCompleted] = useState<number[]>([]);
  const [steps, setSteps] = useState<StepperSteps[]>([
    {
      step: 1,
      label: "Details",
    },
    {
      step: 2,
      label: "Zone",
    },
    {
      step: 3,
      label: "Invite User",
    },
  ]);
  const [active, setActive] = useState<number>(1);

  const handleStep = (status: number, value: string) => {
    const completedSteps = getLocalStorage("COMSTE");
    if (completedSteps) {
      setCompleted(JSON.parse(completedSteps));
    }
    setActive(parseFloat(value));
  };

  return (
    <div className="w-full h-full p-4 rounded-2xl bg-snow flex flex-col gap-4">
      <div className="flex justify-between gap-4 w-full flex-wrap md:flex-nowrap">
        <div className="flex gap-4 items-center w-full md:w-1/2">
          <IconBox
            action="back"
            icon="left-arrow.svg"
            className="!bg-ghostWhite !rounded-2xl p-2.5 border-platinum border"
          />
          <h5 className="text-sm text-smokyBlack font-medium">
            Onboard New Customer
          </h5>
        </div>
        <div className="w-full pr-6">
          <Stepper active={active} steps={steps} completed={completed} />
        </div>
      </div>
      <div className="w-full h-full overflow-y-auto scrollbar-none pt-8">
        {active === 1 && <CompanyInfo callback={handleStep} canEdit={true} />}
        {active === 2 && <Zone callback={handleStep} canEdit={true} />}
        {active === 3 && <InviteUser canEdit={true} />}
      </div>
    </div>
  );
};

export default CreateCustomer;
