import useClickOutside from "@/hooks/useClickOutside";
import { useRef } from "react";
import { DropDownProps } from "@/types/dropdown";
import { ActionButton } from "./Buttons";
import { Actions } from "@/types/button";

const DropDown: React.FC<DropDownProps> = ({
  show,
  options,
  onChange,
  setShow,
  left,
  right,
  labelWithImage,
  images,
  actions,
  full,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside([dropdownRef], () => setShow(false));
  return (
    <div
      ref={dropdownRef}
      style={{ left: left, right: right }}
      className={`bg-snow shadow-medium custom-scrollbar absolute z-50 top-full mt-2 flex flex-col gap-1 rounded-2xl py-2 p-2 overflow-y-auto ${
        full ? "w-full" : "w-max max-w-72"
      } transition-all transform duration-300 ease-in-out ${
        show
          ? "max-h-56 opacity-100 pointer-events-auto scale-100"
          : "opacity-0 pointer-events-none scale-95 h-0"
      }`}
    >
      {labelWithImage &&
      images &&
      images.length > 0 &&
      actions &&
      actions.length > 0 ? (
        <div className="px-3 flex flex-col gap-2">
          {options.map((item, index) => (
            <ActionButton
              key={index}
              data={{
                loading: false,
                disabled: false,
                icon: images[index],
                label: item,
                name: actions[index] as Actions,
              }}
              onClick={(name) => onChange(name)}
            />
          ))}
        </div>
      ) : (
        options.map((item, index) => (
          <button
            key={index}
            title={full ? undefined : item}
            onClick={() => {
              onChange(item);
              setShow(false);
            }}
            className={`hover hover:bg-platinum  text-smokyBlack text-sm flex-none  font-medium px-4 py-2 rounded-md text-left ${
              !full && "truncate"
            }  focus-visible:outline-none`}
          >
            {item}
          </button>
        ))
      )}
    </div>
  );
};

export default DropDown;
