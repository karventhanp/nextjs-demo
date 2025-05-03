import { CompanyPocFormData, Customer, CustomerProps } from "@/types/customer";
import { useEffect, useState } from "react";
import { Input, TelInput } from "../common/Inputs";
import { getLocalStorage, isValidEmail, setLocalStorage } from "@/utils/utils";
import { isValidPhoneNumber } from "react-phone-number-input";
import { StepperButtons } from "@/types/button";
import { StepperButton } from "../common/Buttons";
import {
  areAllKeyValuesMatched,
  areAllRequiredFieldsFilled,
  extractPOCUpdateData,
  extractPOCUserData,
  updateStepperButtons,
} from "@/helpers/helper";
import { authService } from "@/services/authService";
import { UserData, UserPayload } from "@/types/user";

const PocInfo: React.FC<CustomerProps> = ({
  callback = () => {},
  viewFlow,
  viewData,
  canEdit,
}) => {
  const [form, setForm] = useState<CompanyPocFormData>({
    firstName: {
      name: "firstName",
      label: "First Name",
      error: null,
      required: true,
      value: "",
    },
    lastName: {
      name: "lastName",
      label: "Last Name",
      error: null,
      required: true,
      value: "",
    },
    email: {
      name: "email",
      label: "Email ID",
      error: null,
      required: true,
      value: "",
    },
    phoneNumber: {
      name: "phoneNumber",
      label: "Phone Number",
      error: null,
      required: true,
      value: "",
    },
  });
  const [buttons, setButtons] = useState<StepperButtons>({
    cancel: {
      loading: false,
      disabled: true,
      label: "Cancel",
      name: "cancel",
    },
    next: { loading: false, disabled: true, label: "Next", name: "next" },
    submit: { loading: false, disabled: true, label: "Save", name: "submit" },
  });
  const [customer, setCustomer] = useState<Customer>();

  const handleInput = (key: string, value: string) => {
    setForm((prev) => {
      let error = null;
      if (
        key in prev &&
        "required" in prev[key as keyof CompanyPocFormData] &&
        prev[key as keyof CompanyPocFormData].required
      ) {
        error = value.trim() === "" ? "This field is required." : null;
      }
      if (value !== "") {
        if (key === "email") {
          error = isValidEmail(value) ? null : "Enter valid email.";
        }
        if (key === "phoneNumber") {
          error = isValidPhoneNumber(value)
            ? null
            : "Enter valid phone number.";
        }
      }

      return updateFormState(prev, key, value, error);
    });
  };

  const updateFormState = (
    prev: CompanyPocFormData,
    key: string,
    value: string,
    error: string | null
  ) => {
    return {
      ...prev,
      [key]: {
        ...prev[key as keyof CompanyPocFormData],
        value,
        error,
      },
    };
  };

  const handleSubmit = async () => {
    const assignedProducts = customer?.attributes["products"];
    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "next", values: { disabled: true, loading: true } },
        { key: "submit", values: { disabled: true, loading: true } },
      ])
    );
    if (isAllFieldsValid()) {
      const customerId = getLocalStorage("CUSID");
      if (customerId) {
        const extractedData = viewFlow
          ? extractPOCUpdateData(form, viewData as UserData)
          : extractPOCUserData(form, customerId, assignedProducts ?? []);
        if (extractedData) {
          const response = viewFlow
            ? await authService.updateUser(
                (viewData as UserData).id,
                extractedData
              )
            : await authService.createUser(extractedData as UserPayload);
          if (response.status === 202 || response.status === 204) {
            if (!viewFlow) setLocalStorage("COMSTE", JSON.stringify([1]));
            callback(200, "2");
          }
        }
      }
    }
    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "next", values: { disabled: false, loading: false } },
        { key: "submit", values: { disabled: false, loading: false } },
      ])
    );
  };

  const isAllFieldsValid = () => {
    if (
      areAllRequiredFieldsFilled(form) &&
      areAllKeyValuesMatched(form, "error", null)
    ) {
      return true;
    }
    return false;
  };

  const getCustomerById = async () => {
    const customerId = getLocalStorage("CUSID");
    if (customerId) {
      const response = await authService.getCustomerById(customerId);
      if (response.status === 200) {
        setCustomer(response.data);
      }
    }
  };

  useEffect(() => {
    if (viewFlow && viewData) {
      const data = viewData as UserData;
      setForm((prev) => ({
        firstName: { ...prev.firstName, value: data.firstName },
        lastName: { ...prev.lastName, value: data.lastName },
        phoneNumber: {
          ...prev.phoneNumber,
          value: data.attributes?.["phoneNumber"]?.[0],
        },
        email: { ...prev.email, value: data.email },
      }));
    }
  }, [viewData]);

  useEffect(() => {
    if (isAllFieldsValid()) {
      setButtons((prev) =>
        updateStepperButtons(prev, [
          { key: "next", values: { disabled: false } },
          { key: "submit", values: { disabled: false } },
        ])
      );
    } else {
      setButtons((prev) =>
        updateStepperButtons(prev, [
          { key: "next", values: { disabled: true } },
          { key: "submit", values: { disabled: true } },
        ])
      );
    }
  }, [form]);

  useEffect(() => {
    getCustomerById();
  }, []);

  return (
    <div className="h-fit w-full gap-4 flex flex-col">
      <div className="flex flex-col p-4 gap-4 w-full border border-platinum rounded-2xl">
        <h5 className="text-liver text-sm font-medium">Point of contact</h5>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 w-full flex-wrap md:flex-nowrap">
            <Input
              props={{ ...form.firstName, readonly: !canEdit }}
              onChange={handleInput}
            />
            <Input
              props={{ ...form.lastName, readonly: !canEdit }}
              onChange={handleInput}
            />
          </div>
          <div className="flex gap-4 w-full flex-wrap md:flex-nowrap">
            <Input
              props={{ ...form.email, readonly: !canEdit }}
              onChange={handleInput}
            />
            <TelInput
              props={{ ...form.phoneNumber, readonly: !canEdit }}
              defaultCountry="IN"
              onChange={handleInput}
            />
          </div>
        </div>
      </div>
      {!viewFlow && (
        <div className="flex justify-end gap-4">
          {buttons.cancel && (
            <StepperButton data={buttons.cancel} onClick={() => {}} />
          )}
          {buttons.next && (
            <StepperButton data={buttons.next} onClick={handleSubmit} />
          )}
        </div>
      )}
      {viewFlow && canEdit && (
        <div className="flex justify-end gap-4">
          {buttons.submit && (
            <StepperButton data={buttons.submit} onClick={handleSubmit} />
          )}
        </div>
      )}
    </div>
  );
};

export default PocInfo;
