import {
  DateInputProps,
  InputProps,
  SelectInputProps,
  InputWithSelectProps,
  TabToggleInputProps,
  CheckBoxProps,
  TelInputProps,
  InputWithTagProps,
  TagSwitcherInputProps,
  Option,
  MultipleSelectInputProps,
  ToggleSwitcherInputProps,
  SearchInputProps,
  FilterInputProps,
  SelectWithTagProps,
} from "@/types/input";
import CustomDatePicker from "./CustomDatePicker";
import Image from "next/image";
import DropDown from "./DropDown";
import React, { useEffect, useRef, useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import OptimizedDropDown from "./OptimizedDropDown";
import FilterDropDown from "../inspection/FilterDropDown";
import useClickOutside from "@/hooks/useClickOutside";
import { useAppContext } from "@/context/AppContext";
import Tooltip from "../inspection/common/ToolTip";

export const Input: React.FC<InputProps> = ({
  props,
  onChange = () => {},
  hideLabel,
  padding,
}) => {
  return (
    <div className={`w-full h-fit flex flex-col gap-1 ${props.width}`}>
      <label
        className={`text-trollyGray text-sm ${
          hideLabel ? "hidden" : "flex"
        } flex gap-1`}
      >
        {props.label}{" "}
        {props.required && <span className="text-carminePink text-sm">*</span>}
      </label>
      <input
        type="text"
        name={props.name}
        autoComplete="off"
        value={props.value}
        className={`border w-full bg-snow ${
          props.error ? "!border-carminePink" : "border-platinum"
        } rounded-lg  h-[44px] ${
          padding ? padding : "py-3 px-2"
        } text-smokyBlack text-sm font-medium focus:outline-none focus:ring-0 focus:border-primary read-only:focus:border-platinum disabled:bg-platinum`}
        onChange={(e) => onChange(e.target.name, e.target.value)}
        readOnly={props.readonly}
        disabled={props.disabled}
        placeholder={props.placeholder}
      />
      <span
        className={`text-xs text-carminePink font-normal ${
          props.error ? "block" : "hidden"
        }`}
      >
        {props.error}
      </span>
    </div>
  );
};

export const TextAreaInput: React.FC<InputProps> = ({
  props,
  onChange = () => {},
  hideLabel,
  padding,
}) => {
  return (
    <div className={`w-full h-full flex flex-col gap-1 ${props.width}`}>
      <label
        className={`text-trollyGray text-sm ${
          hideLabel ? "hidden" : "flex"
        } gap-1`}
      >
        {props.label}{" "}
        {props.required && <span className="text-carminePink text-sm">*</span>}
      </label>
      <textarea
        name={props.name}
        autoComplete="off"
        value={props.value}
        readOnly={props.readonly}
        className={`border w-full h-full bg-snow ${
          props.error ? "!border-carminePink" : "border-platinum"
        } rounded-lg ${
          padding ? padding : "py-3 px-2"
        } text-smokyBlack scrollbar-none text-sm font-medium focus:outline-none focus:ring-0 focus:border-primary read-only:pointer-events-none disabled:bg-platinum`}
        onChange={(e) => onChange(e.target.name, e.target.value)}
        disabled={props.disabled}
      />
      <span
        className={`text-xs text-carminePink font-normal ${
          props.error ? "block" : "hidden"
        }`}
      >
        {props.error}
      </span>
    </div>
  );
};

export const DateInput: React.FC<DateInputProps> = ({
  props,
  onChange = () => {},
  hideLabel,
  maxDate,
}) => {
  return (
    <div className={`h-fit flex flex-col gap-1`}>
      <label
        className={`text-trollyGray text-sm ${
          hideLabel ? "hidden" : "flex"
        } gap-1`}
      >
        {props.label}{" "}
        {props.required && <span className="text-sm text-carminePink">*</span>}
      </label>
      <CustomDatePicker
        maxDate={maxDate}
        error={props.error}
        value={props.value}
        readOnly={props.readonly}
        updateDate={(date) => onChange(props.name, date?.toString() || "")}
      />
      <span
        className={`text-xs text-carminePink font-normal ${
          props.error ? "block" : "hidden"
        }`}
      >
        {props.error}
      </span>
    </div>
  );
};

export const InputWithSelect: React.FC<InputWithSelectProps> = ({
  props,
  onChange = () => {},
  onUnitChange = () => {},
  hideLabel,
}) => {
  const [selected, setSelected] = useState<string>("");
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [initial, setInitial] = useState<boolean>(true);

  useEffect(() => {
    onUnitChange(props.name, selected);
  }, [selected]);

  useEffect(() => {
    if (props.unitValue) {
      setSelected(props.unitValue);
    } else {
      props.options.length > 0
        ? setSelected(props.options[0])
        : setSelected("");
    }
  }, [props.unitValue]);

  useEffect(() => {
    if (initial) {
      setInitial(false);
      setSelected(props.options[0] || "");
    }
  }, [props.options]);
  return (
    <div className={`w-full h-fit flex flex-col gap-1 ${props.width}`}>
      <label
        className={`text-trollyGray text-sm ${
          hideLabel ? "hidden" : "flex"
        } gap-1`}
      >
        {props.label}{" "}
        {props.required && <span className="text-carminePink text-sm">*</span>}
      </label>
      <div className={`w-full flex`}>
        <input
          type="text"
          name={props.name}
          autoComplete="off"
          value={props.value}
          className={`border-y border-l w-full bg-snow ${
            props.error ? "!border-carminePink" : "border-platinum"
          } rounded-y-lg rounded-l-lg py-3 h-[44px] px-2 text-smokyBlack text-sm font-medium focus:outline-none focus:ring-0 read-only:pointer-events-none disabled:bg-platinum focus:border-primary`}
          onChange={(e) => onChange(props.name, e.target.value)}
          readOnly={props.readonly}
          disabled={props.disabled}
        />
        <div
          onClick={() => setShowOptions(!showOptions)}
          className={`h-[44px] relative w-fit p-3 flex cursor-pointer justify-center items-center gap-2 border-r border-y rounded-r-lg border-platinum bg-transparent ${
            props.readonly && "pointer-events-none"
          } ${props.disabled && "bg-platinum"}`}
        >
          <label className="text-liver text-sm font-medium cursor-pointer">
            {selected}
          </label>
          {props.options.length > 1 && (
            <>
              <Image
                src="/images/chevron-down-icon.svg"
                width={16}
                height={16}
                alt="Down Arrow Icon"
              />
              <DropDown
                options={props.options}
                right={0}
                setShow={() => setShowOptions(false)}
                show={showOptions}
                onChange={(value: string) => setSelected(value)}
              />
            </>
          )}
        </div>
      </div>
      <span
        className={`text-xs text-carminePink font-normal ${
          props.error ? "block" : "hidden"
        }`}
      >
        {props.error}
      </span>
    </div>
  );
};

export const SelectInput: React.FC<SelectInputProps> = ({
  props,
  tag,
  tagValue,
  onChange = () => {},
  hideLabel,
}) => {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>("");
  const [items, setItems] = useState<string[]>(props.options);
  const [initial, setInitial] = useState<boolean>(true);

  const filterItems = (value: string) => {
    const filteredItems = props.options.filter((item) =>
      item.toLowerCase().startsWith(value.toLowerCase())
    );
    if (filteredItems.length > 0) {
      setShowOptions(true);
      setItems(filteredItems);
    } else {
      setShowOptions(false);
    }
  };

  useEffect(() => {
    setItems(props.options);
  }, [props.options]);

  useEffect(() => {
    if (initial) {
      setInitial(false);
    } else {
      onChange(props.name, selected);
    }
  }, [selected]);

  return (
    <div className={`w-full h-fit flex flex-col gap-1 ${props.width}`}>
      <label
        className={`text-trollyGray text-sm ${
          hideLabel ? "hidden" : "flex"
        } gap-1`}
      >
        {props.label}{" "}
        {props.required && <span className="text-sm text-carminePink">*</span>}
      </label>
      <div className="flex">
        <div className="relative w-full">
          <input
            type="text"
            name={props.name}
            placeholder={`Choose ${props.label.toLowerCase()}`}
            value={props.value}
            autoComplete="off"
            readOnly={props.readonly || !props.editInput}
            className={`border w-full placeholder:font-normal placeholder:text-sm bg-snow ${
              props.error ? "!border-carminePink" : "border-platinum"
            } ${props.readonly && "pointer-events-none"} ${
              !props.editInput && "cursor-pointer"
            } ${
              tag ? " rounded-l-lg" : " rounded-lg"
            } py-3 h-11 pl-2 pr-10 text-smokyBlack text-sm font-medium focus:outline-none focus:ring-0 focus:border-primary disabled:bg-platinum`}
            onChange={(e) => {
              filterItems(e.target.value);
              setSelected(e.target.value);
            }}
            onClick={() => items.length > 0 && setShowOptions(true)}
            disabled={props.disabled}
          />
          {!props.disabled && !props.readonly && (
            <Image
              src="/images/chevron-down-icon.svg"
              width={16}
              height={16}
              alt="Down Arrow Icon"
              onClick={() => items.length > 0 && setShowOptions(true)}
              className="absolute top-1/2 -translate-y-1/2 right-4"
            />
          )}
          <DropDown
            show={showOptions}
            setShow={setShowOptions}
            options={items}
            onChange={(value) => setSelected(value)}
          />
        </div>
        {tag && (
          <div
            className={`text-sm text-smokyBlack font-medium text-nowrap h-11 min-w-12 max-w-40 overflow-x-auto scrollbar-none border-r border-t border-b border-platinum rounded-r-lg py-3 px-2 flex justify-center items-center ${
              tagValue ? "bg-transparent" : "bg-platinum"
            }`}
          >
            {tagValue}
          </div>
        )}
      </div>
      <span
        className={`text-xs text-carminePink font-normal ${
          props.error ? "block" : "hidden"
        }`}
      >
        {props.error}
      </span>
    </div>
  );
};

export const TabToggleInput: React.FC<TabToggleInputProps> = ({
  data,
  onChange = () => {},
}) => {
  return (
    <div className="flex w-full flex-col h-full gap-1">
      <label className="text-trollyGray text-sm gap-1 flex">
        {data.label}
        {data.required && <span className="text-sm text-carminePink">*</span>}
      </label>
      <div className="h-[44px] border border-platinum rounded-lg flex gap-2 p-1.5 w-full">
        {data.options &&
          data.options.length > 0 &&
          data.options.map((item, index) => (
            <button
              onClick={() => onChange(item.id)}
              className={`bg-transparent font-medium text-sm w-full ${
                data.active - 1 === index
                  ? "border border-primary text-smokyBlack"
                  : "text-liver"
              } rounded-md p-1 flex justify-center items-center`}
              key={item.id}
            >
              {item.name}
            </button>
          ))}
      </div>
    </div>
  );
};

export const CheckBox: React.FC<CheckBoxProps> = ({
  data,
  onChange = () => {},
  labelColor,
}) => {
  const handleClick = () => {
    if (!data.disabled) {
      onChange(data.name);
    }
  };
  return (
    <div
      className={`w-full flex gap-2 items-center ${
        data.disabled && "cursor-not-allowed"
      } ${data.readonly && "pointer-events-none"}`}
      onClick={handleClick}
    >
      <Image
        src="/images/checkbox-primary.svg"
        width={24}
        height={24}
        alt="Checkbox Active"
        className={`${data.active ? "block" : "hidden"} ${
          data.disabled ? "cursor-not-allowed" : "cursor-pointer"
        } w-5`}
      />
      <Image
        src="/images/checkbox-black.svg"
        width={24}
        height={24}
        alt="Checkbox"
        className={`${data.active ? "hidden" : "block"} ${
          data.disabled ? "cursor-not-allowed" : "cursor-pointer"
        } w-5`}
      />
      <label
        className={` ${
          labelColor ? labelColor : "text-smokyBlack"
        }  text-sm flex ${
          data.disabled ? "cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        {data.label}
      </label>
    </div>
  );
};

export const TelInput: React.FC<TelInputProps> = ({
  props,
  onChange = () => {},
  defaultCountry,
}) => {
  return (
    <div className="w-full flex flex-col h-fit gap-1">
      <div className={`w-full h-fit flex flex-col gap-1`}>
        <label className="text-trollyGray text-sm gap-1 flex">
          {props.label}
          {props.required && (
            <span className="text-sm text-carminePink">*</span>
          )}
        </label>
        <PhoneInput
          className="h-[44px]"
          value={props.value}
          onChange={(value) => onChange(props.name, value ?? "")}
          defaultCountry={defaultCountry}
          readOnly={props.readonly}
        />
      </div>
      <span
        className={`text-xs text-carminePink font-normal ${
          props.error ? "block" : "hidden"
        }`}
      >
        {props.error}
      </span>
    </div>
  );
};

export const InputWithTag: React.FC<InputWithTagProps> = ({
  props,
  onChange = () => {},
  labelIcon,
  labelIconContent,
  onClick = () => {},
}) => {
  return (
    <div className="w-full flex flex-col gap-1">
      <label className="text-trollyGray text-sm gap-1 flex items-center">
        {props.label}
        {props.required && <span className="text-sm text-carminePink">*</span>}
        {labelIcon &&
          props &&
          props?.disabled === true &&
          props.tooltip !== "" && (
            <Tooltip text={props?.tooltip || ""} position="top">
              {labelIconContent?.src && <Image {...labelIconContent} />}
            </Tooltip>
          )}
      </label>
      <div className="w-full flex" onClick={() => onClick(true)}>
        <div className="border border-r-0 border-platinum flex justify-center items-center text-liver font-medium rounded-l-lg p-2 text-sm">
          {props.tag}
        </div>
        <input
          type="text"
          name={props.name}
          autoComplete="off"
          value={props.value || ""}
          placeholder={props.placeholder}
          className={`border w-full bg-snow ${
            props.error ? "!border-carminePink" : "border-platinum"
          } ${
            props.readonly && "cursor-pointer"
          } rounded-r-lg  py-3 px-2 h-11 text-smokyBlack text-sm font-medium focus:outline-none focus:ring-0 focus:border-primary read-only:focus:border-platinum disabled:bg-platinum`}
          onChange={(e) => onChange(e.target.name, e.target.value)}
          readOnly={props.readonly}
          disabled={props.disabled}
        />
        {props.tag === "Zone" && (
          <Image
            src="/images/chevron-down-icon.svg"
            width={16}
            height={16}
            alt="Down Arrow Icon"
            className="absolute top-[55%] items-center right-4"
          />
        )}
      </div>
    </div>
  );
};

export const MultipleSelectInput: React.FC<MultipleSelectInputProps> = ({
  props,
  onChange = () => {},
  selectAll = () => {},
}) => {
  const [show, setShow] = useState<boolean>(false);
  return (
    <div className="w-full flex flex-col gap-1">
      <label className="text-trollyGray text-sm gap-1 flex">
        {props.label}
        {props.required && <span className="text-sm text-carminePink">*</span>}
      </label>
      <div className="w-full relative">
        <div
          className={`border w-full bg-snow ${
            props.error ? "!border-carminePink" : "border-platinum"
          } rounded-lg py-3 h-[44px] px-2 text-smokyBlack text-sm font-medium flex gap-2 items-center cursor-pointer`}
          onClick={() => setShow(true)}
        >
          <Image
            src="/images/rounded-plus-gray.svg"
            className="cursor-pointer"
            width={24}
            height={24}
            alt="Add"
          />
          {props.value && props.value.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              {props.value.map((value, index) => (
                <div
                  key={index}
                  className="flex gap-1 bg-ghostWhite rounded-lg p-2 min-w-fit w-fit"
                >
                  <span className="text-trollyGray text-xs font-medium">
                    {
                      props.options.find((option) => option.value === value)
                        ?.label
                    }
                  </span>
                  <Image
                    src="/images/close-black.svg"
                    width={13}
                    height={13}
                    alt="Remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(props.name, value);
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <span className="text-sm font-medium text-trollyGray cursor-pointer">
              Select {props.name}
            </span>
          )}
        </div>
        <OptimizedDropDown
          options={props.options}
          show={show}
          setShow={setShow}
          mutilpleSelect={true}
          selectedValues={props.value}
          onChange={(key, value) => onChange(props.name, value)}
          selectAll={(all) => selectAll(props.name, all)}
        />
      </div>
      <span
        className={`text-xs text-carminePink font-normal ${
          props.error ? "block" : "hidden"
        }`}
      >
        {props.error}
      </span>
    </div>
  );
};

export const TagSwitcher: React.FC<TagSwitcherInputProps> = ({
  props,
  onChange = () => {},
  hideLabel,
}) => {
  const [show, setShow] = useState<boolean>(false);
  const [tag, setTag] = useState<Option>();

  useEffect(() => {
    setTag(props.options.find((option) => option.value === props.value));
  }, [props.value, props.options]);

  return (
    <div className="w-fit h-full flex flex-col gap-1">
      {!hideLabel && (
        <label className="text-trollyGray text-sm gap-1 flex">
          {props.label}
          {props.required && (
            <span className="text-sm text-carminePink">*</span>
          )}
        </label>
      )}

      <div
        className="border border-platinum w-full min-w-40 flex gap-2 py-2.5 px-2 rounded-lg h-[44px] items-center cursor-pointer relative"
        onClick={() => setShow(true)}
      >
        <span
          className={` ${
            tag?.className
              ? tag.className
              : "border-primary text-primary bg-primary/5"
          } text-xs border font-medium rounded-lg px-4 py-1 w-full text-center`}
        >
          {tag?.label}
        </span>
        <Image src="/images/selector.svg" width={22} height={22} alt="Switch" />
        <OptimizedDropDown
          show={show}
          setShow={setShow}
          onChange={(_, value) => onChange(props.name, value)}
          options={props.options}
          showSplitter={true}
        />
      </div>
    </div>
  );
};

export const ToggleSwitcher: React.FC<ToggleSwitcherInputProps> = ({
  props,
  hideLabel,
  reverseStyle = false,
  onChange = () => {},
}) => {
  const isActive = props.active;
  const bgColor =
    reverseStyle
      ? isActive
        ? "bg-mistyRose"
        : "bg-ivory"
      : isActive
        ? "bg-ivory"
        : "bg-mistyRose";

  const textColor =
    reverseStyle
      ? isActive
        ? "text-carminePink"
        : "text-primary"
      : isActive
        ? "text-primary"
        : "text-carminePink";

  return (
    <div
      className={`w-fit h-8.5 min-h-8.5 border border-platinum rounded-lg p-1 cursor-pointer relative flex items-center transition-all duration-300 ease-in-out ${
        isActive ? "flex-row-reverse" : "flex-row"
      } ${bgColor}`}
      onClick={() => onChange(props.name, !isActive)}
    >
      <div
        className={`absolute top-1 left-1 w-6 h-6 rounded-lg bg-snow shadow-soft transition-all duration-300 ease-in-out transform ${
          isActive
            ? "translate-x-16 scale-100 opacity-100"
            : "translate-x-0 scale-95 opacity-90"
        }`}
      ></div>
      <div
        className={`min-w-22 w-full h-full text-sm font-medium flex items-center transition-colors duration-300 relative z-10 justify-center ${
          isActive ? "pr-9 pl-2" : "pl-9 pr-2"
        } ${textColor}`}
      >
        {!hideLabel && (isActive ? props.activeLabel : props.inActiveLabel)}
      </div>
    </div>
  );
};

export const SearchInput: React.FC<SearchInputProps> = ({
  props,
  onChange = () => {},
}) => {
  return (
    <div className="w-full relative">
      <input
        type="text"
        name={props.name}
        className="rounded-2xl border border-platinum ring-0 h-11 py-3 pl-10 pr-10 placeholder:text-liver placeholder:font-normal w-full focus:border-primary text-sm text-smokyBlack font-medium bg-transparent focus:ring-0"
        placeholder={`Search ${props.name}`}
        value={props.value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Image
        src="/images/search-icon.svg"
        width={20}
        height={20}
        alt="Search"
        className="absolute top-1/2 left-2 -translate-y-1/2"
      />
      <Image
        src="/images/close-grey.svg"
        width={18}
        height={18}
        alt="Clear"
        onClick={() => onChange("")}
        className={`absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer ${
          props.value.length === 0 ? "hidden" : "block"
        }`}
      />
    </div>
  );
};

export const FilterInput: React.FC<FilterInputProps> = ({
  props,
  onChange = () => {},
  onDateChange = () => {},
  onFilterItemChange = () => {},
  option,
}) => {
  const {
    calendar,
    dropDown,
    value,
    searchIcon,
    placeholder,
    isZoneFilter,
    isAutoComplete,
  } = props;

  const calendarRef = useRef<HTMLDivElement>(null);
  const [showZone, setShowZone] = useState<boolean>(false);
  const { zone } = useAppContext();
  const [filteredOption, setFilteredOption] = useState<Option[] | undefined>();
  const [selectedZone, setSelectedZone] = useState<Option[] | undefined>();
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [filterItem, setFilterItem] = useState<string | undefined>("both");
  const [inputValue, setInputValue] = useState<string | undefined>();
  const [date, setDate] = useState<{
    from: Date | null;
    to: Date | null;
  }>();

  const handleZoneAction = (action: string) => {
    const selectedZone = zone?.filter((item) => item.value === action);
    onChange(action);
    setSelectedZone(selectedZone);
    setShowZone(false);
  };

  useEffect(() => {
    if (filterItem) onFilterItemChange(filterItem);
    setShowFilter(false);
  }, [filterItem]);

  useEffect(() => {
    if (date && date.from && date.to) {
      onDateChange(date);
      setShowCalendar(false);
    } else if (date && !date.from && !date.to) {
      onDateChange(date);
    }
  }, [date]);

  useEffect(() => {
    setFilteredOption(option);
  }, [zone]);

  useEffect(() => {
    if (value === "Zone") {
      const updatedList = (zone || []).filter((item) =>
        item.label.toLowerCase().includes(inputValue?.toLowerCase() || "")
      );
      setFilteredOption(inputValue ? updatedList : zone || []);
    }
  }, [inputValue]);

  useClickOutside([calendarRef], () => {
    setShowCalendar(false);
  });

  return (
    <div
      className={`relative flex sm:flex ${
        props.flex ? "sm:" + props.flex : "flex-1"
      }`}
    >
      <div className="flex w-full border border-platinum rounded-2xl">
        <div
          className="relative flex items-center min-w-fit border-r px-2 gap-2 rounded-l-2xl cursor-pointer"
          onClick={() => setShowFilter(!showFilter)}
        >
          <h5 className="text-sm text-smokyBlack">
            {dropDown
              ? filterItem === "both"
                ? "All"
                : "Site " + filterItem
              : value}
          </h5>
          {dropDown && (
            <>
              <Image
                src="/images/caret-down.svg"
                width={24}
                height={24}
                className="w-5"
                alt="Choose filter"
              />
              <FilterDropDown
                show={showFilter}
                close={() => setShowFilter(false)}
                updateFilter={setFilterItem}
              />
            </>
          )}
        </div>
        <div className="relative w-full">
          <label
            htmlFor="search-inspection"
            className="absolute top-1/2 -translate-y-1/2 left-2 z-10"
          >
            {searchIcon && (
              <Image
                src="/images/search-icon.svg"
                className="w-5"
                width={24}
                height={24}
                alt="Search Icon"
              />
            )}
          </label>
          <input
            type="text"
            placeholder={isZoneFilter && selectedZone ? "" : placeholder}
            id="search-inspection"
            onInput={(e) => {
              value !== "Zone"
                ? onChange((e.target as HTMLInputElement).value)
                : setInputValue((e.target as HTMLInputElement).value);
            }}
            autoComplete={isAutoComplete ? "on" : "off"}
            onClick={() => isZoneFilter && setShowZone(true)}
            className={`placeholder:text-liver py-3 focus:ring-0 w-full text-sm text-smokyBlack bg-snow ${
              searchIcon ? "pl-10" : "pl-4"
            } pr-12 border-none focus:outline-none focus:border-primary focus:border rounded-r-2xl  ${
              date && date.from && date.to && "pr-75"
            }`}
          />
          <OptimizedDropDown
            options={filteredOption || []}
            show={showZone}
            setShow={setShowZone}
            onChange={(_, action) => handleZoneAction(action)}
            showSplitter={true}
            fitContainer={true}
          />
          {(date?.from && date?.to) || selectedZone ? (
            <div className="flex items-center absolute top-1/2 -translate-y-1/2 right-12 text-sm gap-2">
              <div className="border border-platinum flex gap-3 rounded-lg px-2 py-1">
                {date?.from && date?.to ? (
                  <>
                    <label>{date.from.toLocaleDateString("en-GB")}</label>
                    <Image
                      src="/images/right-arrow.svg"
                      className="w-5"
                      width={24}
                      height={24}
                      alt="Arrow"
                    />
                    <label>{date.to.toLocaleDateString("en-GB")}</label>
                  </>
                ) : (
                  <label>{selectedZone?.[0]?.label}</label>
                )}
              </div>
              <Image
                src="/images/close-black.svg"
                className="w-5 cursor-pointer"
                width={24}
                height={24}
                onClick={() =>
                  date?.from && date?.to
                    ? setDate?.({ from: null, to: null })
                    : (setSelectedZone?.(undefined), onChange(""))
                }
                alt="Close"
              />
            </div>
          ) : null}
          {calendar && (
            <Image
              src="/images/calendar.svg"
              className="absolute top-1/2 -translate-y-1/2 right-4 w-5 cursor-pointer"
              width={24}
              height={24}
              onClick={() => setShowCalendar(!showCalendar)}
              alt="Calendar"
            />
          )}
          {!searchIcon && (
            <Image
              src="/images/selector.svg"
              className="absolute top-1/2 -translate-y-1/2 right-4 w-5 cursor-pointer"
              width={24}
              height={24}
              onClick={() => setShowZone(!showZone)}
              alt="Selector"
            />
          )}
        </div>
      </div>
      {calendar && showCalendar && (
        <div
          ref={calendarRef}
          className={`absolute w-fit right-0 top-14 z-50 transition-all duration-300 transform ease-in-out ${
            showCalendar
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-97 pointer-events-none"
          }`}
        >
          <div className="flex flex-wrap sm:flex-row bg-snow w-full shadow-medium rounded-2xl p-4 gap-4 z-50">
            <CustomDatePicker
              updateDate={(date) =>
                setDate((prev) => ({
                  ...prev,
                  from: date,
                  to: prev?.to || null,
                }))
              }
              value={date?.from?.toString()}
              maxDate={new Date()}
            />
            <Image
              src="/images/right-arrow.svg"
              className="w-full h-5 sm:h-auto sm:w-5 rotate-90 sm:rotate-0"
              width={24}
              height={24}
              alt="Right Arrow"
            />
            <CustomDatePicker
              updateDate={(date) =>
                setDate((prev) => ({
                  ...prev,
                  from: prev?.from || null,
                  to: date,
                }))
              }
              value={date?.to?.toString()}
              maxDate={new Date()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
