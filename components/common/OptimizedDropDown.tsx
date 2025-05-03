import useClickOutside from "@/hooks/useClickOutside";
import { useEffect, useRef, useState } from "react";
import { CheckBox } from "./Inputs";
import { Option } from "@/types/input";
import Image from "next/image";

interface OptimizedDropDownProps {
  show: boolean;
  setShow: (value: boolean) => void;
  options: Option[];
  onChange?: (key: string, value: string) => void;
  mutilpleSelect?: boolean;
  selectedValues?: string[];
  selectAll?: (value: boolean) => void;
  showAbove?: boolean;
  showSplitter?: boolean;
  position?: "right" | "left";
  fitContainer?: boolean;
  fillContainer?: boolean;
}

const OptimizedDropDown: React.FC<OptimizedDropDownProps> = ({
  show,
  setShow,
  options,
  onChange = () => {},
  selectAll = () => {},
  mutilpleSelect,
  selectedValues,
  showAbove,
  showSplitter,
  position,
  fitContainer,
  fillContainer,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [filter, setFilter] = useState<Option[]>();
  const [isAbove, setIsAbove] = useState(false);

  const handleOnSelect = (key: string, value: string) => {
    onChange(key, value);
    if (!mutilpleSelect) {
      setShow(false);
    }
  };

  useEffect(() => {
    if (showAbove) {
      setIsAbove(true);
    } else if (dropdownRef.current) {
      const parentElement = dropdownRef.current?.parentElement;
      if (parentElement) {
        const parentRect = parentElement.getBoundingClientRect();
        const dropdownHeight = dropdownRef.current.offsetHeight || 0;
        const viewportHeight = window.innerHeight;
        if (parentRect) {
          setIsAbove(parentRect.bottom + dropdownHeight > viewportHeight);
        }
      }
    }
  }, [show]);

  useEffect(() => {
    if (mutilpleSelect && searchValue) {
      setFilter((prev) =>
        prev?.filter((item) =>
          item.label.toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    } else {
      setFilter(options);
    }
  }, [searchValue, options]);

  useClickOutside([dropdownRef], () => setShow(false));

  return (
    <div
      ref={dropdownRef}
      onClick={(e) => e.stopPropagation()}
      className={`bg-snow shadow-medium custom-scrollbar absolute ${
        position === "right" ? "right-0" : "left-0"
      } z-50 ${
        isAbove ? "bottom-full mb-2" : "top-full mt-2"
      } flex flex-col gap-3 rounded-2xl h-fit ${
        fitContainer ? "w-fit max-w-fit min-w-fit" : "w-fit min-w-32 max-w-48"
      } ${fillContainer && "min-w-full"} overflow-y-auto ${
        mutilpleSelect ? "max-h-80" : "max-h-60"
      } transition-all transform duration-300 ease-in-out ${
        show
          ? "opacity-100 pointer-events-auto scale-100"
          : "opacity-0 pointer-events-none scale-95 h-0"
      }`}
    >
      {mutilpleSelect && (
        <div className="w-full px-3 pt-3">
          <input
            type="text"
            name="search"
            placeholder="Search"
            onChange={(e) => setSearchValue(e.target.value)}
            value={searchValue}
            className="h-[34px] text-sm focus:ring-0 focus:border-primary border w-full border-platinum rounded-lg"
          />
        </div>
      )}
      {filter && filter.length > 0 ? (
        <div
          className={`flex flex-col rounded-2xl ${
            mutilpleSelect && "h-fit overflow-y-auto custom-scrollbar"
          }`}
        >
          {filter.map((item, index) => (
            <button
              key={index}
              title={item.label}
              onClick={(e) => {
                e.stopPropagation();
                handleOnSelect(item.name, item.value);
              }}
              className={`bg-snow text-smokyBlack text-sm flex-none ${
                showSplitter && "border-b border-platinum last:border-b-0"
              } first:rounded-t-2xl last:rounded-b-2xl px-3 py-2 font-medium text-left truncate focus-visible:outline-none`}
            >
              {mutilpleSelect ? (
                <CheckBox
                  data={{
                    active: !!selectedValues?.includes(item.value),
                    label: item.label,
                    name: item.value,
                  }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  {item.icon && (
                    <Image
                      src={`/images/${item.icon}`}
                      width={22}
                      height={22}
                      alt={item.label}
                    />
                  )}
                  <span
                    className={`truncate rounded-lg p-1 text-sm ${item.className}`}
                  >
                    {item.label}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center text-liver text-sm font-normal px-2">
          No results found
        </div>
      )}
      {mutilpleSelect && (
        <div className="px-3 pb-3">
          <div
            onClick={() =>
              selectAll(
                options.length === selectedValues?.length ? false : true
              )
            }
            className="text-sm text-liver font-medium text-center border border-t border-platinum rounded-lg p-1 cursor-pointer"
          >
            {" "}
            {options.length === selectedValues?.length
              ? "Clear All"
              : "Select all"}
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedDropDown;
