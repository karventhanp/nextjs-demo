import {
  SolinasUserFormData,
  UserData,
  UserFormData,
  UserUpdatePayload,
} from "@/types/user";
import { useEffect, useState } from "react";
import { Input, MultipleSelectInput, ToggleSwitcher } from "../common/Inputs";
import { StepperButton } from "../common/Buttons";
import { ActionButtons, StepperButtons } from "@/types/button";
import { UserRolePayload } from "@/types/roles";
import { Option, ToggleSwitcherForm } from "@/types/input";
import {
  areAllKeyValuesMatched,
  areAllRequiredFieldsFilled,
  extractSolinasUserData,
  extractUserData,
  getCustomerIds,
  sanitizeCustomerName,
  toggleArrayValue,
  updateArray,
  updateStepperButtons,
} from "@/helpers/helper";
import { isValidEmail } from "@/utils/utils";
import { useAppContext } from "@/context/AppContext";
import { authService } from "@/services/authService";
import { Customer, ProductTypes } from "@/types/customer";
import Constants from "@/constants/constants";

const SolinasUser = () => {
  const [form, setForm] = useState<SolinasUserFormData>({
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
      required: false,
      value: "",
    },
    mailAddress: {
      name: "mailAddress",
      label: "Email Address",
      error: null,
      required: true,
      value: "",
    },
    products: {
      name: "products",
      label: "Products",
      error: null,
      required: true,
      value: [],
    },
    customers: {
      name: "customers",
      label: "Customers",
      error: null,
      required: true,
      value: [],
    },
  });
  const [buttons, setButtons] = useState<StepperButtons>({
    cancel: {
      loading: false,
      disabled: false,
      label: "Cancel",
      name: "cancel",
    },
    submit: {
      loading: false,
      disabled: true,
      label: "Invite",
      name: "submit",
    },
  });
  const [enabled, setEnabled] = useState<ToggleSwitcherForm>({
    name: "active",
    activeLabel: "Active",
    inActiveLabel: "Inactive",
    required: false,
    active: true,
  });

  const [products, setProducts] = useState<Option[]>([]);
  const [customerOption, setCustomerOption] = useState<Option[]>([]);
  const {
    customers,
    setShowOffCanvas,
    setIsUserAdded,
    canvaUser,
    isUserInvite,
    isUserAdded,
    solinasId,
    setIsUserInvite,
  } = useAppContext();
  const [customer, setCustomer] = useState<Customer>();

  const handleInput = (key: string, value: string) => {
    setForm((prev) => {
      let error = null;
      if (key in prev && prev[key as keyof SolinasUserFormData].required) {
        if (key === "products") {
          const updatedProducts = updateArray(prev.products.value ?? [], value);
          error =
            updatedProducts.length === 0 ? "This field is required." : null;
        } else if (key === "customers") {
          const updatedCustomers = updateArray(
            prev.customers.value ?? [],
            value
          );
          error =
            updatedCustomers.length === 0 ? "This field is required." : null;
        } else {
          error = value.trim() === "" ? "This field is required." : null;
        }
      }
      if (value !== "") {
        if (key === "mailAddress") {
          error = isValidEmail(value) ? null : "Enter valid email.";
        }
      }

      const updatedForm: SolinasUserFormData = updateFormState(
        prev,
        key,
        value,
        error
      );

      return updatedForm;
    });
  };

  const updateFormState = (
    prev: SolinasUserFormData,
    key: string,
    value: string,
    error: string | null
  ) => {
    return {
      ...prev,
      [key]: {
        ...prev[key as keyof SolinasUserFormData],
        value: Array.isArray(prev[key as keyof SolinasUserFormData]?.value)
          ? toggleArrayValue(
              prev[key as keyof SolinasUserFormData]?.value as string[],
              value as string
            )
          : value,
        error,
      },
    };
  };

  const handleSelectAll = (key: string, select: boolean) => {
    setForm((prev) => ({
      ...prev,
      [key]: {
        ...prev[key as keyof SolinasUserFormData],
        value: select
          ? key === "customers"
            ? customerOption.map((customer) => customer.value)
            : products.map((product) => product.value)
          : [],
      },
    }));
  };

  const getCustomerById = async () => {
    if (solinasId) {
      const response = await authService.getCustomerById(solinasId);
      if (response.status === 200) {
        setCustomer(response.data);
      }
    }
  };

  const handleSubmit = async () => {
    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "submit", values: { disabled: true, loading: true } },
      ])
    );

    if (solinasId && isAllFieldsValid() && canvaUser && canvaUser.id) {
      const extractedData: UserUpdatePayload = {
        email: form.mailAddress.value,
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        enabled: enabled.active,
        attributes: {
          ASSIGNED_PRODUCTS: [...(form.products.value ?? "")],
          ASSIGNED_CUSTOMERS: [...(form.customers.value ?? "")],
        },
      };

      const response = await authService.updateUser(
        canvaUser.id,
        extractedData
      );
      if (response.status === 204) {
        setShowOffCanvas(false);
        setIsUserAdded(true);
      }
    }

    setIsUserInvite(false);
    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "submit", values: { disabled: true, loading: false } },
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

  const setInputValues = (
    prev: SolinasUserFormData,
    user?: UserData
  ): SolinasUserFormData => {
    setEnabled((prev) => ({ ...prev, active: user ? user.enabled : false }));
    return {
      ...prev,
      firstName: { ...prev.firstName, value: user ? user.firstName : "" },
      lastName: { ...prev.lastName, value: user ? user.lastName : "" },
      mailAddress: { ...prev.mailAddress, value: user ? user.email : "" },
      products: {
        ...prev.products,
        value: user ? user.attributes?.[Constants.ASSIGNED_PRODUCTS] : [],
      },
      customers: {
        ...prev.customers,
        value: user ? user.attributes?.[Constants.ASSIGNED_CUSTOMERS] : [],
      },
    };
  };

  const handleToggle = (key: string, value: boolean) => {
    setEnabled((prev) => ({ ...prev, active: value }));
  };

  useEffect(() => {
    if (isAllFieldsValid()) {
      setButtons((prev) =>
        updateStepperButtons(prev, [
          { key: "submit", values: { disabled: false } },
        ])
      );
    } else {
      setButtons((prev) =>
        updateStepperButtons(prev, [
          { key: "submit", values: { disabled: true } },
        ])
      );
    }
  }, [form, enabled]);

  useEffect(() => {
    setIsUserAdded(false);
    if (isUserInvite) {
      setForm((prev) => setInputValues(prev));
      setButtons((prev) => ({
        ...prev,
        submit: prev.submit ? { ...prev.submit, label: "Invite" } : prev.submit,
      }));
    } else {
      setButtons((prev) => ({
        ...prev,
        submit: prev.submit ? { ...prev.submit, label: "Save" } : prev.submit,
      }));
    }
  }, [isUserInvite]);

  useEffect(() => {
    setIsUserAdded(false);
    if (canvaUser) {
      setForm((prev) => setInputValues(prev, canvaUser));
    }
  }, [canvaUser]);

  useEffect(() => {
    const assignedProducts = customer
      ? customer.attributes[Constants.PRODUCTS]
      : [];
    if (assignedProducts.length > 0) {
      const product: Option[] = assignedProducts
        .map((product) =>
          Object.values(ProductTypes).find((p) => p.value === product)
        )
        .filter((p): p is Option => !!p);
      setProducts(product);
    }
  }, [customer]);

  useEffect(() => {
    if (customers.length > 0) {
      const option: Option[] = customers.map((customer) => ({
        label: customer.name,
        value: customer.id,
        name: customer.id,
      }));
      setCustomerOption(option);
    }
  }, [customers]);

  useEffect(() => {
    getCustomerById();
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="w-full flex justify-between items-center pr-14">
        <h5 className="text-smokyBlack text-base font-medium">User</h5>
        {!isUserInvite && (
          <div className="w-full justify-end flex">
            <ToggleSwitcher props={enabled} onChange={handleToggle} />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 w-full">
        <div className="flex gap-4 w-full flex-wrap md:flex-nowrap">
          <Input
            props={{ ...form.firstName, readonly: true }}
            onChange={handleInput}
          />
          <Input
            props={{ ...form.lastName, readonly: true }}
            onChange={handleInput}
          />
        </div>
        <Input
          props={{ ...form.mailAddress, readonly: true }}
          onChange={handleInput}
        />
        <MultipleSelectInput
          props={{ ...form.products, options: products }}
          onChange={handleInput}
          selectAll={handleSelectAll}
        />
        <MultipleSelectInput
          props={{ ...form.customers, options: customerOption }}
          onChange={handleInput}
          selectAll={handleSelectAll}
        />
      </div>
      <div className="flex justify-end gap-4 h-full items-end">
        {buttons.cancel && (
          <StepperButton
            data={buttons.cancel}
            onClick={() => setShowOffCanvas(false)}
          />
        )}
        {buttons.submit && (
          <StepperButton data={buttons.submit} onClick={handleSubmit} />
        )}
      </div>
    </div>
  );
};

export default SolinasUser;
