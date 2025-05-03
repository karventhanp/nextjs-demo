import { NumberTabProps } from "@/types/common";
import Image from "next/image";

const NumberTab: React.FC<NumberTabProps> = ({
  data,
  createTab,
  switchTab,
  removeTab = () => {},
  canRemoveTab,
}) => {
  return (
    <div className="w-fit p-2 bg-whiteSmoke border border-platinum rounded-lg flex gap-2">
      {data.tabs.map((tab, index) => (
        <div
          key={index}
          className={`${
            data.active === tab.id
              ? "bg-primary text-snow"
              : "bg-whiteSmoke text-smokyBlack border border-platinum"
          } w-8 h-8 flex justify-center items-center text-sm rounded-lg cursor-pointer hover:border relative group`}
          onClick={() => switchTab(tab.id)}
        >
          <div
            className={`bg-snow shadow-md w-fit h-fit p-0.5 justify-center items-center rounded-full absolute -top-2 -right-2 hidden ${
              data.tabs.length > 1 && canRemoveTab && "group-hover:flex"
            }`}
            onClick={() => removeTab(tab.id)}
          >
            <Image
              src="/images/close-black.svg"
              width={14}
              height={14}
              alt="Remove"
            />
          </div>
          {tab.id}
        </div>
      ))}
      <div
        className="w-8 h-8 flex justify-center items-center text-sm rounded-lg cursor-pointer hover:bg-white/40"
        onClick={createTab}
      >
        <Image
          src="/images/plus-black-bold.svg"
          width={22}
          height={22}
          alt="Plus"
        />
      </div>
    </div>
  );
};

export default NumberTab;
