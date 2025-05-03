import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { Country } from "react-phone-number-input";

//Form Field
export type Field<T> = {
  label: string;
  name: string;
  value: T | undefined;
  error: string | null;
  required: boolean;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  tooltip?: string;
};

export type FormState = Record<string, Field<any>>;

type Input = {
  label: string;
  name: string;
  value: string | undefined;
  width?: string;
  required?: boolean;
  error?: string | null;
  readonly?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

export interface InputProps {
  onChange?: (key: string, value: string) => void;
  props: Input;
  hideLabel?: boolean;
  padding?: string;
}

type DateInput = {
  label: string;
  name: string;
  value: string | undefined;
  required?: boolean;
  error?: string | null;
  readonly?: boolean;
  disabled?: boolean;
};

export interface DateInputProps {
  props: DateInput;
  onChange?: (key: string, value: string) => void;
  hideLabel?: boolean;
  maxDate?: Date;
}

type SelectInput = {
  label: string;
  name: string;
  options: string[];
  value: string | undefined;
  width?: string;
  required?: boolean;
  error?: string | null;
  readonly?: boolean;
  disabled?: boolean;
  editInput: boolean;
};

export interface SelectInputProps {
  props: SelectInput;
  tag?: boolean;
  tagValue?: string | undefined;
  onChange?: (key: string, value: string) => void;
  hideLabel?: boolean;
}

type InputWithSelect = {
  label: string;
  name: string;
  options: string[];
  value: string | undefined;
  width?: string;
  required?: boolean;
  error?: string | null;
  unitValue?: string;
  readonly?: boolean;
  disabled?: boolean;
};

export interface InputWithSelectProps {
  props: InputWithSelect;
  onChange?: (key: string, value: string) => void;
  onUnitChange?: (key: string, value: string) => void;
  hideLabel?: boolean;
}

export interface TabToggleInputData {
  active: number;
  label: string;
  required: boolean;
  options: { id: number; name: string; readonly: boolean }[];
}

export interface TabToggleInputProps {
  data: TabToggleInputData;
  onChange?: (id: number) => void;
}

export interface CheckBoxData {
  active: boolean;
  label: string;
  name: string;
  readonly?: boolean;
  disabled?: boolean;
}

export interface CheckBoxProps {
  data: CheckBoxData;
  onChange?: (value: string) => void;
  labelColor?: string;
}

export interface TelInputData {
  name: string;
  label: string;
  value: string | undefined;
  required: boolean;
  error: string | null;
  readonly?: boolean;
  disabled?: boolean;
}

export interface TelInputProps {
  props: TelInputData;
  defaultCountry: Country;
  hideLabel?: boolean;
  onChange?: (key: string, value: string) => void;
}

export interface InputWithTagData {
  name: string;
  label: string;
  value: string | undefined;
  tag: string;
  required: boolean;
  error?: string | null;
  readonly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  tooltip?: string;
}

export type CustomImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  title?: string;
};

export interface InputWithTagProps {
  props: InputWithTagData;
  onChange?: (key: string, value: string) => void;
  labelIcon?: boolean;
  labelIconContent?: CustomImageProps;
  onClick?: (value: boolean) => void;
}

export interface Option {
  label: string;
  value: string;
  name: string;
  icon?: string;
  className?: string;
  index?: number;
}

export interface TagSwitcherInput {
  name: string;
  label: string;
  value: string | undefined;
  required: boolean;
  options: Option[];
  error?: string | null;
  readonly?: boolean;
  disabled?: boolean;
}

export interface TagSwitcherInputProps {
  props: TagSwitcherInput;
  onChange?: (key: string, value: string) => void;
  hideLabel?: boolean;
}

export interface MultipleSelectInput {
  name: string;
  label: string;
  value: string[] | undefined;
  required: boolean;
  options: Option[];
  error?: string | null;
  readonly?: boolean;
  disabled?: boolean;
}

export interface MultipleSelectInputProps {
  props: MultipleSelectInput;
  onChange?: (key: string, value: string) => void;
  selectAll?: (key: string, select: boolean) => void;
}

export interface ToggleSwitcherForm {
  name: string;
  active: boolean;
  required: boolean;
  activeLabel: string;
  inActiveLabel: string;
}

export interface ToggleSwitcherInput {
  name: string;
  active: boolean;
  required: boolean;
  activeLabel: string;
  inActiveLabel: string;
  readonly?: boolean;
  disabled?: boolean;
}

export interface ToggleSwitcherInputProps {
  props: ToggleSwitcherInput;
  reverseStyle?: boolean;
  hideLabel?: boolean;
  onChange?: (key: string, value: boolean) => void;
}

export interface SearchInputForm {
  name: string;
  value: string;
  label?: string;
  readonly?: boolean;
  disabled?: boolean;
}

export interface SearchInputProps {
  props: SearchInputForm;
  onChange?: (value: string) => void;
}

export interface FilterInputForm {
  calendar?: boolean;
  dropDown?: boolean;
  value?: string;
  searchIcon?: boolean;
  placeholder?: string;
  isZoneFilter?: boolean;
  flex?: string;
  isAutoComplete?: boolean;
}

export interface FilterInputProps {
  props: FilterInputForm;
  onChange?: (value: string) => void;
  onFilterItemChange?: (value: string) => void;
  onDateChange?: (date: { from: Date | null; to: Date | null }) => void;
  option?: Option[];
}

type SelectWithTag = {
  label: string;
  name: string;
  options: string[];
  value: string | undefined;
  required?: boolean;
  error?: string | null;
  readonly?: boolean;
  disabled?: boolean;
};

export interface SelectWithTagProps {
  props: SelectWithTag;
  tag: string | undefined;
  onChange?: (key: string, value: string) => void;
  hideLabel?: boolean;
}
