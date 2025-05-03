import { UserData, UserFormData, UserUpdatePayload } from "@/types/user";
import { useEffect, useState } from "react";
import {
  Input,
  MultipleSelectInput,
  TagSwitcher,
  TelInput,
  ToggleSwitcher,
} from "../common/Inputs";
import { ActionButton, StepperButton } from "../common/Buttons";
import { ActionButtons, StepperButtons } from "@/types/button";
import { Role, Roles, UserRole, UserRolePayload } from "@/types/roles";
import { Option, ToggleSwitcherForm } from "@/types/input";
import {
  areAllKeyValuesMatched,
  areAllRequiredFieldsFilled,
  extractUserData,
  formatCustomerName,
  getCustomerId,
  getCustomerIds,
  toggleArrayValue,
  updateActionButton,
  updateArray,
  updateStepperButtons,
} from "@/helpers/helper";
import { getLocalStorage, isValidEmail } from "@/utils/utils";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useAppContext } from "@/context/AppContext";
import { authService } from "@/services/authService";
import { Customer, ProductTypes } from "@/types/customer";
import Constants from "@/constants/constants";

const User = () => {
  const [form, setForm] = useState<UserFormData>({
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
    phoneNumber: {
      name: "phoneNumber",
      label: "Phone Number",
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
    role: {
      name: "role",
      label: "Role",
      error: null,
      required: true,
      value: UserRole.VIEWER,
    },
    customers: {
      name: "customers",
      label: "Assign customers",
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
  const [roles, setRoles] = useState<Option[]>([]);
  const [enabled, setEnabled] = useState<ToggleSwitcherForm>({
    name: "active",
    activeLabel: "Active",
    inActiveLabel: "Inactive",
    required: false,
    active: true,
  });
  const [actions, setActions] = useState<ActionButtons>();
  const [products, setProducts] = useState<Option[]>([]);
  const [customerOption, setCustomerOption] = useState<Option[]>([]);
  const {
    customers,
    setShowOffCanvas,
    isCustomerUser,
    customerId,
    setIsUserAdded,
    canvaUser,
    isUserInvite,
    isUserAdded,
    clientRoles,
    isCustomerOnboarding,
    setIsUserInvite,
    allowedActions,
  } = useAppContext();
  const [customer, setCustomer] = useState<Customer>();
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

  const handleInput = (key: string, value: string) => {
    setForm((prev) => {
      let error = null;
      if (key in prev && prev[key as keyof UserFormData].required) {
        if (key === "products") {
          const updatedProducts = updateArray(prev.products.value, value);
          error =
            updatedProducts.length === 0 ? "This field is required." : null;
        } else if (key === "customers") {
          const updatedCustomers = updateArray(prev.customers.value, value);
          error =
            updatedCustomers.length === 0 ? "This field is required." : null;
        } else {
          error = value.trim() === "" ? "This field is required." : null;
        }
      }
      if (value !== "") {
        if (key === "mailAddress") {
          error = isValidEmail(value) ? null : "Enter valid email.";
        } else if (key === "phoneNumber") {
          error = isValidPhoneNumber(value) ? null : "Enter valid phonenumber";
        }
      }

      const updatedForm: UserFormData = updateFormState(
        prev,
        key,
        value,
        error
      );

      if (key === "role" && value !== UserRole.FSA) {
        updatedForm.customers = { ...updatedForm.customers, value: [] };
      }
      return updatedForm;
    });
  };

  const updateFormState = (
    prev: UserFormData,
    key: string,
    value: string,
    error: string | null
  ) => {
    return {
      ...prev,
      [key]: {
        ...prev[key as keyof UserFormData],
        value: Array.isArray(prev[key as keyof UserFormData]?.value)
          ? toggleArrayValue(
              prev[key as keyof UserFormData]?.value as string[],
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
        ...prev[key as keyof UserFormData],
        value: select
          ? key === "customers"
            ? customerOption.map((customer) => customer.value)
            : products.map((product) => product.value)
          : [],
      },
    }));
  };

  const getCustomerById = async () => {
    const cusId = isCustomerOnboarding
      ? getCustomerId()
      : customerId
      ? customerId
      : getCustomerId();
    if (cusId) {
      const response = await authService.getCustomerById(cusId);
      if (response.status === 200) {
        setCustomer(response.data);
      }
    }
  };

  const processRoles = () => {
    isCustomerUser
      ? setRoles([
          {
            label: "Admin",
            name: UserRole.ADMIN,
            value: UserRole.ADMIN,
            className: "border-glitter text-royalBlue bg-royalBlue/5",
          },
          {
            label: "User",
            name: UserRole.FSA,
            value: UserRole.FSA,
            className: "border-almond text-tangelo bg-tangelo/5",
          },
          {
            label: "Viewer",
            name: UserRole.VIEWER,
            value: UserRole.VIEWER,
            className: "border-wolf text-charcoal bg-charcoal/5",
          },
        ])
      : setRoles(Object.values(Roles));
  };

  const handleSubmit = async () => {
    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "submit", values: { disabled: true, loading: true } },
      ])
    );
    const cusId = isCustomerOnboarding
      ? getLocalStorage("CUSID")
      : customerId
      ? customerId
      : getCustomerId();
    if (cusId && isAllFieldsValid()) {
      if (isUserInvite) {
        const extractedData = extractUserData(form, cusId);
        if (extractedData) {
          const response = await authService.createUser(extractedData);
          if (response.status === 202) {
            setIsUserAdded(true);
            setShowOffCanvas(false);
          }
        }
      } else {
        const extractedData: UserUpdatePayload = {
          email: form.mailAddress.value,
          firstName: form.firstName.value,
          lastName: form.lastName.value,
          enabled: enabled.active,
          attributes: {
            phoneNumber: [form.phoneNumber.value ?? ""],
            ASSIGNED_PRODUCTS: [...(form.products.value ?? "")],
          },
        };
        if (!isCustomerUser) {
          extractedData.attributes = {
            ...extractedData.attributes,
            ASSIGNED_CUSTOMERS: [...(form.customers.value ?? "")],
          };
        }
        if (extractedData && canvaUser && canvaUser.id) {
          const response = await authService.updateUser(
            canvaUser.id,
            extractedData
          );
          if (form.role.value !== canvaUser.role) {
            const deleteRoleResponse = await authService.removeUserRole(
              canvaUser.id,
              { id: canvaUser.roleId, name: canvaUser.role }
            );
            const matchedRole = availableRoles.find(
              (role) => role.name === form.role.value
            );
            const role: UserRolePayload | undefined = matchedRole
              ? { id: matchedRole.id, name: matchedRole.name }
              : undefined;
            if (role) {
              const updateRoleResponse = await authService.addRoleToUser(
                canvaUser.id,
                role
              );
              if (
                response.status === 204 &&
                deleteRoleResponse.status === 204 &&
                updateRoleResponse.status === 204
              ) {
                setShowOffCanvas(false);
                setIsUserAdded(true);
              }
            }
          } else {
            if (response.status === 204) {
              setShowOffCanvas(false);
              setIsUserAdded(true);
            }
          }
        }
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
    const isFsa = (form.role.value as UserRole) === "fsa";
    if (
      areAllRequiredFieldsFilled(
        form,
        isFsa && !isCustomerUser ? [] : ["customers"]
      ) &&
      areAllKeyValuesMatched(form, "error", null)
    ) {
      return true;
    }
    return false;
  };

  const getAllUserRoles = async () => {
    if (canvaUser && canvaUser.id) {
      const response = await authService.getAllUserRoles(canvaUser.id);
      if (response.status === 200) {
        setAvailableRoles(response.data);
      }
    }
  };

  const setInputValues = (
    prev: UserFormData,
    user?: UserData
  ): UserFormData => {
    setEnabled((prev) => ({ ...prev, active: user ? user.enabled : false }));
    return {
      ...prev,
      firstName: { ...prev.firstName, value: user ? user.firstName : "" },
      lastName: { ...prev.lastName, value: user ? user.lastName : "" },
      mailAddress: { ...prev.mailAddress, value: user ? user.email : "" },
      phoneNumber: {
        ...prev.phoneNumber,
        value: user ? user.attributes?.["phoneNumber"]?.[0] : "",
      },
      products: {
        ...prev.products,
        value: user ? user.attributes?.[Constants.ASSIGNED_PRODUCTS] : [],
      },
      customers: {
        ...prev.customers,
        value: user ? user.attributes?.[Constants.ASSIGNED_CUSTOMERS] : [],
      },
      role: { ...prev.role, value: user ? user.role : UserRole.VIEWER },
    };
  };

  const handleToggle = (key: string, value: boolean) => {
    setEnabled((prev) => ({ ...prev, active: value }));
  };

  const deleteUser = async () => {
    if (canvaUser && canvaUser.id) {
      setActions((prev) =>
        updateActionButton(prev || {}, [
          { key: "delete", values: { disabled: true, loading: true } },
        ])
      );
      const response = await authService.deleteUser(canvaUser.id);
      if (response.status === 204) {
        setIsUserAdded(true);
        setShowOffCanvas(false);
      }
      setActions((prev) =>
        updateActionButton(prev || {}, [
          { key: "delete", values: { disabled: false, loading: false } },
        ])
      );
    }
  };

  useEffect(() => {
    if (allowedActions && allowedActions.delete) {
      setActions((prev) => ({
        ...prev,
        delete: {
          disabled: false,
          icon: "delete-icon.svg",
          label: "Delete",
          loading: false,
          name: "delete",
        },
      }));
    }
  }, [allowedActions]);

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
      getAllUserRoles();
      setForm((prev) => setInputValues(prev, canvaUser));
    }
  }, [canvaUser]);

  useEffect(() => {
    const assignedProducts = customer ? customer.attributes["products"] : [];
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
    processRoles();
  }, [customerId, isCustomerUser]);

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
          <Input props={form.firstName} onChange={handleInput} />
          <Input props={form.lastName} onChange={handleInput} />
        </div>
        <Input props={form.mailAddress} onChange={handleInput} />
        <TelInput
          props={form.phoneNumber}
          defaultCountry="IN"
          onChange={handleInput}
        />
        <MultipleSelectInput
          props={{ ...form.products, options: products }}
          onChange={handleInput}
          selectAll={handleSelectAll}
        />
        <TagSwitcher
          props={{ ...form.role, options: roles }}
          onChange={handleInput}
        />
        {form.role.value === UserRole.FSA && !isCustomerUser && (
          <MultipleSelectInput
            props={{ ...form.customers, options: customerOption }}
            onChange={handleInput}
            selectAll={handleSelectAll}
          />
        )}
      </div>
      <div className="flex justify-between gap-4 h-full w-full items-end">
        <div>
          {actions && actions.delete && !isUserInvite && (
            <ActionButton data={actions.delete} onClick={deleteUser} />
          )}
        </div>
        <div className="flex gap-4">
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
    </div>
  );
};

export default User;
