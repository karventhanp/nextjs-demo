export interface ButtonProps {
  name: string;
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}

export type StepperButtonData = {
  loading: boolean;
  disabled: boolean;
  label: string;
  name:
    | "next"
    | "submit"
    | "more"
    | "back"
    | "cancel"
    | "skip"
    | "process"
    | "invite";
};

export interface StepperButtons {
  cancel?: StepperButtonData;
  back?: StepperButtonData;
  next?: StepperButtonData;
  skip?: StepperButtonData;
  submit?: StepperButtonData;
  more?: StepperButtonData;
  process?: StepperButtonData;
  invite?: StepperButtonData;
}

export interface StepperButtonProps {
  data: StepperButtonData;
  onClick: (name: string) => void;
}

export type Actions = "download" | "edit" | "delete" | "primary";

export interface ActionButtonData {
  loading: boolean;
  disabled: boolean;
  label: string;
  name: Actions;
  icon: string;
}

export interface ActionButtons {
  download?: ActionButtonData;
  delete?: ActionButtonData;
  edit?: ActionButtonData;
  primary?: ActionButtonData;
}

export interface ActionButtonProps {
  data: ActionButtonData;
  onClick: (name: string) => void;
}
