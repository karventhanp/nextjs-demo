import { StepperSteps } from "@/types/common";
import Image from "next/image";

interface StepperProps {
  active: number;
  completed: number[];
  steps: StepperSteps[];
}

const Stepper: React.FC<StepperProps> = ({ active, completed, steps }) => {

  return (
    <div className="h-full flex justify-between m-auto items-center w-full gap-2">
      {steps.map((step, index) => (
        <div
          className={`flex items-center ${
            index + 1 === steps.length ? "w-fit" : "w-full"
          } gap-2`}
          key={index}
        >
          <div className="flex flex-col items-center justify-center relative">
            <div
              className={`p-2.5 w-4 h-4 ${
                completed.includes(index + 1) ? "hidden" : "flex"
              } ${
                active === index + 1
                  ? "border-primary outline outline-1 outline-celeste"
                  : "border-platinum"
              } border-4 rounded-lg items-center justify-center text-smokyBlack text-sm font-medium cursor-pointer hover:outline hover:outline-1 hover:outline-celeste hover:border-primary`}
            >
              <span>{step.step}</span>
            </div>
            <div
              className={`bg-primary min-w-6 w-6 h-6 flex justify-center items-center rounded-lg ${
                completed.includes(index + 1) ? "flex" : "hidden"
              }`}
            >
              <Image
                src="/images/tabler-white.svg"
                width={24}
                height={24}
                alt="Completed"
              />
            </div>
            <h5 className="text-sm text-liver font-medium absolute whitespace-nowrap -bottom-7 left-1/2 -translate-x-1/2">
              {step.label}
            </h5>
          </div>

          <div
            className={`w-full h-full self-start pt-3.5 ${
              index + 1 === steps.length ? "hidden" : "flex"
            }`}
          >
            <div
              className={`w-full rounded-lg ${
                completed.includes(index + 1) ? "bg-primary" : "bg-platinum"
              }  h-0.5`}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stepper;
