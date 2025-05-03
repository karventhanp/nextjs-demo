import useClickOutside from "@/hooks/useClickOutside";
import { useRef } from "react";

const FilterDropDown:React.FC<{show:boolean; close: () => void; updateFilter : (item: string) => void}> = ({updateFilter, show, close}) => {
  const filterRef = useRef<HTMLDivElement>(null);

  useClickOutside([filterRef], () => {
    close()
  });

  return (
    <div ref={filterRef} className={`min-w-28 h-fit bg-snow text-sm absolute text-smokyBlack rounded-2xl top-12 left-0 shadow-medium flex flex-col z-50 transition-all duration-300 ease-in-out transform ${show ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
      <label className="border-b border-platinum p-2 pl-3 cursor-pointer" onClick={() => updateFilter("both")}>All</label>
      <label className="border-b border-platinum p-2 pl-3 cursor-pointer" onClick={() => updateFilter("name")}>Site name</label>
      <label className="p-2 cursor-pointer pl-3" onClick={() => updateFilter("address")}>Site address</label>
    </div>
  );
};

export default FilterDropDown;
