"use client";

import Stepper from "@/components/common/Stepper";
import InspectionDetails from "@/components/inspection/create/InspectionDetails";
import Questionaries from "@/components/inspection/create/Questionaries";
import Observations from "@/components/inspection/create/Observations";
import { getLocalStorage, removeLocalStorage } from "@/utils/utils";
import { useEffect, useState } from "react";
import InSights from "@/components/inspection/create/InSights";
import { IconBox } from "@/components/common/IconBox";
import { useAppContext } from "@/context/AppContext";
import { StepperSteps } from "@/types/common";
import Constants from "@/constants/constants";

const CreateInspection = () => {
  const [completed, setCompleted] = useState<number[]>([]);
  const [steps, setSteps] = useState<StepperSteps[]>([
    {
      step: 1,
      label: "Details",
    },
    {
      step: 2,
      label: "Questionaries",
    },
    {
      step: 3,
      label: "Observations",
    },
    {
      step: 4,
      label: "Insights",
    },
  ]);
  const [active, setActive] = useState<number>(1);
  const { allowedActions } = useAppContext();

  const updatePage = (page: number, skip: boolean) => {
    setActive(page);
    if (!skip) {
      const completedPages = getLocalStorage("COMPIID");
      completedPages
        ? setCompleted(JSON.parse(completedPages))
        : setCompleted([1]);
    }
  };

  useEffect(() => {
    removeLocalStorage(Constants.INSPECTION_ID);
    removeLocalStorage(Constants.COMPLETED_IN);
  }, []);

  return (
    <div className="w-full h-full bg-snow rounded-2xl p-4 flex flex-col gap-4">
      <div className="flex gap-4 items-center flex-wrap md:flex-nowrap justify-between">
        <div className="w-full flex items-center gap-4">
          <IconBox
            action="back"
            icon="left-arrow.svg"
            className="!bg-ghostWhite !rounded-2xl p-2.5 border-platinum border"
          />
          <h5 className="font-medium text-smokyBlack text-[15px]">
            Create Inspection
          </h5>
        </div>
        <div className="pb-8 pr-4 w-full m-auto">
          <Stepper active={active} steps={steps} completed={completed} />
        </div>
      </div>
      <div className="flex flex-col h-full gap-4 overflow-y-scroll scrollbar-none">
        {active === 1 && (
          <div className="flex flex-col gap-4">
            <h5 className="text-smokyBlack text-[15px] font-medium">
              Inspection Details
            </h5>
            <InspectionDetails
              createFlow={true}
              updatePage={(page, skip) => updatePage(page, skip)}
            />
          </div>
        )}
        {active === 2 && (
          <div className="flex flex-col gap-4">
            <h5 className="text-smokyBlack text-[15px] font-medium">
              Inspection Questionaries
            </h5>
            <Questionaries
              createFlow={true}
              updatePage={(page, skip) => updatePage(page, skip)}
            />
          </div>
        )}
        {active === 3 && (
          <div className="flex flex-col gap-4">
            <h5 className="text-smokyBlack text-[15px] font-medium">
              Inspection Observations
            </h5>
            <Observations
              viewFlow={false}
              canEdit={allowedActions.edit && true}
              updatePage={(page, skip) => updatePage(page, skip)}
            />
          </div>
        )}
        {active === 4 && (
          <div className="flex flex-col gap-4">
            <h5 className="text-smokyBlack text-[15px] font-medium">
              Insights
            </h5>
            <InSights
              createFlow={true}
              updatePage={(page, skip) => updatePage(page, skip)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateInspection;
