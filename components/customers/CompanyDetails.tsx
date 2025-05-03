import {
  Customer,
  CustomerDetails,
  CustomerDetailsFormData,
  CustomerProps,
} from "@/types/customer";
import { useEffect, useState } from "react";
import {
  CheckBox,
  DateInput,
  Input,
  InputWithSelect,
  SelectInput,
  TelInput,
} from "../common/Inputs";
import FileUpload from "../common/FileUpload";
import { FileUploadData, FormRef } from "@/types/common";
import {
  areAllKeyValuesMatched,
  areAllRequiredFieldsFilled,
  extractCustomerDetails,
  formatCustomerName,
  getAddress,
  getLogoName,
  isValidLogo,
  processCustomers,
  updateStepperButtons,
} from "@/helpers/helper";
import {
  getLocalStorage,
  isNumber,
  isValidEmail,
  isValidGSTIN,
  isValidPincode,
  setLocalStorage,
} from "@/utils/utils";
import { StepperButton } from "../common/Buttons";
import { StepperButtons } from "@/types/button";
import { Country } from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { authService } from "@/services/authService";
import { CheckBoxData } from "@/types/input";
import { useAppContext } from "@/context/AppContext";
import { IconBox } from "../common/IconBox";
import Image from "next/image";

const CompanyDetails: React.FC<CustomerProps> = ({
  callback = () => {},
  viewFlow,
  viewData,
  canEdit,
}) => {
  const [form, setForm] = useState<CustomerDetailsFormData>({
    name: {
      name: "name",
      label: "Company Name",
      error: null,
      required: true,
      value: "",
    },
    typeOfPipeLine: {
      name: "typeOfPipeLine",
      label: "Type Of Pipe Line",
      error: null,
      required: true,
      value: "",
    },
    registerNumber: {
      name: "registerNumber",
      label: "Register Number",
      error: null,
      required: true,
      value: "",
    },
    gstin: {
      name: "gstin",
      label: "GSTIN",
      error: null,
      required: true,
      value: "",
    },
    agreementDate: {
      name: "agreementDate",
      label: "Agreement Date",
      error: null,
      required: true,
      value: new Date().toString(),
    },
    phoneNumber: {
      name: "phoneNumber",
      label: "Company Phone Number",
      error: null,
      required: true,
      value: "",
    },
    mailAddress: {
      name: "mailAddress",
      label: "Company Mail Address",
      error: null,
      required: true,
      value: "",
    },
    street: {
      name: "street",
      label: "Street Name",
      error: null,
      required: true,
      value: "",
    },
    area: {
      name: "area",
      label: "Area / Locality",
      error: null,
      required: true,
      value: "",
    },
    landmark: {
      name: "landmark",
      label: "Landmark",
      error: null,
      required: false,
      value: "",
    },
    pincode: {
      name: "pincode",
      label: "Pincode",
      error: null,
      required: true,
      value: "",
    },
    country: {
      name: "country",
      label: "Country",
      error: null,
      required: true,
      value: "",
    },
    state: {
      name: "state",
      label: "State",
      error: null,
      required: true,
      value: "",
    },
    district: {
      name: "district",
      label: "District",
      error: null,
      required: true,
      value: "",
    },
  });
  const [pipeLineType, setPipeLineType] = useState<string[]>([
    "Sewer",
    "Water",
  ]);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreiew, setLogopreview] = useState<string>();
  const [fileType, setFileType] = useState<FileUploadData>({
    multiple: false,
    format: { label: "JPEG, JPG, PNG, WebP", type: ".jpeg, .jpg, .png, .webp" },
    label: "640x640, under 1MB, keep key elements centered.",
  });
  const [country, setCountry] = useState<string[]>([]);
  const [state, setState] = useState<string[]>([]);
  const [district, setDistrict] = useState<string[]>([]);
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
  const [defaultCountry, setDefaultCountry] = useState<Country>("IN");
  const [products, setProducts] = useState<CheckBoxData[]>([
    {
      active: false,
      label: "Inspection",
      name: "in",
    },
    {
      active: false,
      label: "Cleaning",
      name: "cl",
      disabled: true,
    },
    {
      active: false,
      label: "AI",
      name: "ai",
      disabled: true,
    },
    {
      active: false,
      label: "PM",
      name: "pm",
      disabled: true,
    },
  ]);
  const { setCustomers, customerId } = useAppContext();
  const [logoError, setLogoError] = useState<boolean>(false);

  const handleInput = async (key: string, value: string) => {
    setForm((prev) => {
      let error = null;
      if (
        key in prev &&
        prev[key as keyof CustomerDetailsFormData].required === true
      ) {
        if (key === "name") {
          error =
            value.length <= 100 ? null : "Name should be less then 100 chars.";
        } else if (key === "typeOfPipeLine") {
          error = value.trim() === "" ? "Please select a pipe line type" : null;
        } else if (key === "pincode") {
          error =
            isNumber(value) && isValidPincode(value)
              ? null
              : "Enter valid pincode.";
        } else if (key === "mailAddress") {
          error = isValidEmail(value) ? null : "Enter valid email.";
        } else if (key === "phoneNumber") {
          error = isValidPhoneNumber(value)
            ? null
            : "Enter valid phone number.";
        } else if (key === "gstin") {
          value = value.toUpperCase();
          error = isValidGSTIN(value) ? null : "Enter valid GSTIN.";
        } else {
          error = value.trim() === "" ? "This field is required." : null;
        }
      }
      return updateFormState(prev, key, value, error);
    });

    if (key === "pincode" && isValidPincode(value)) {
      const address = await getAddress(value);
      setForm((prev) =>
        updateFormState(prev, "country", address.country ?? "", null)
      );
      setForm((prev) =>
        updateFormState(prev, "state", address.state ?? "", null)
      );
      setForm((prev) =>
        updateFormState(prev, "district", address.district ?? "", null)
      );
    }
  };

  const handleLogo = async (logo: File) => {
    if (await isValidLogo(logo)) {
      setLogoError(false);
      setLogopreview(URL.createObjectURL(logo));
      setLogo(logo);
      return;
    }
    setLogoError(true);
  };

  const handleCheckBox = (name: string) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.name === name
          ? { ...product, active: !product.active }
          : product
      )
    );
  };

  const updateFormState = (
    prev: CustomerDetailsFormData,
    key: string,
    value: string,
    error: string | null
  ) => {
    return {
      ...prev,
      [key]: {
        ...prev[key as keyof CustomerDetailsFormData],
        value,
        error,
      },
    };
  };

  const isAllFieldsValid = (): boolean => {
    const isLogoValid = logo ? !logoError : true;
    const hasActiveProducts = viewFlow
      ? true
      : products.some((product) => product.active);
    if (
      areAllRequiredFieldsFilled(form) &&
      hasActiveProducts &&
      areAllKeyValuesMatched(form, "error", null) &&
      isLogoValid
    )
      return true;
    return false;
  };

  const getCustomers = async () => {
    const response = await authService.getCustomers({ max: 500 });
    if (response.status === 200) {
      setCustomers(processCustomers(response.data));
    }
  };

  const deleteLogo = () => {
    if (viewFlow) {
      // delete logo
    } else {
      setLogo(null);
      setLogopreview(undefined);
      URL.revokeObjectURL(logoPreiew ?? "");
    }
  };

  const getCustomerLogo = async () => {
    if (customerId) {
      const response = await authService.getCustomerLogo(customerId);
      if (response.status === 200) {
        setLogopreview(URL.createObjectURL(response.data));
      }
    }
  };

  const handleSubmit = async () => {
    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "next", values: { disabled: true, loading: true } },
        { key: "submit", values: { disabled: true, loading: true } },
      ])
    );
    if (isAllFieldsValid()) {
      const customerData = viewData as Customer; // Only for Update Customer
      const assignedProducts = viewFlow
        ? customerData.attributes?.["products"]
        : products
            .filter((product) => product.active)
            .map((product) => product.name);
      const extractedData = await extractCustomerDetails(
        form,
        assignedProducts,
        viewFlow ? customerData.id : undefined,
        viewFlow ? customerData.alias : undefined
      );
      const response = viewFlow
        ? await authService.updateCustomer(customerData.id, extractedData)
        : await authService.createCustomer(extractedData);
      if (response.status === 201 || response.status === 204) {
        if (!viewFlow) {
          const existingId = getLocalStorage("CUSID");
          setLocalStorage("TEMP_CUSID", existingId);
          setLocalStorage("CUSID", response.data);
        }
        if (logo) {
          await authService.uploadCustomerLogo(
            viewFlow ? customerData.id : response.data,
            logo
          );
        }
        callback(200, "2");
        getCustomers();
      }
    }

    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "next", values: { disabled: true, loading: false } },
        { key: "submit", values: { disabled: true, loading: false } },
      ])
    );
  };

  useEffect(() => {
    if (viewFlow && viewData) {
      getCustomerLogo();
      const data = viewData as Customer;

      setForm((prev) => ({
        ...prev,
        name: { ...prev.name, value: formatCustomerName(data.name) },
        typeOfPipeLine: {
          ...prev.typeOfPipeLine,
          value: data.attributes?.["typeOfPipeLine"]?.[0] ?? "",
        },
        registerNumber: {
          ...prev.registerNumber,
          value: data.attributes?.["registerNumber"]?.[0] ?? "",
        },
        agreementDate: {
          ...prev.agreementDate,
          value: data.attributes?.["agreementDate"]?.[0] ?? "",
        },
        gstin: {
          ...prev.gstin,
          value: data.attributes?.["gstin"]?.[0] ?? "",
        },
        phoneNumber: {
          ...prev.phoneNumber,
          value: data.attributes?.["phoneNumber"]?.[0] ?? "",
        },
        mailAddress: {
          ...prev.mailAddress,
          value: data.attributes?.["mailAddress"]?.[0] ?? "",
        },
        street: {
          ...prev.street,
          value: data.attributes?.["street"]?.[0] ?? "",
        },
        area: {
          ...prev.area,
          value: data.attributes?.["area"]?.[0] ?? "",
        },
        landmark: {
          ...prev.landmark,
          value: data.attributes?.["landmark"]?.[0] ?? "",
        },
        pincode: {
          ...prev.pincode,
          value: data.attributes?.["pincode"]?.[0] ?? "",
        },
        country: {
          ...prev.country,
          value: data.attributes?.["country"]?.[0] ?? "",
        },
        state: {
          ...prev.state,
          value: data.attributes?.["state"]?.[0] ?? "",
        },
        district: {
          ...prev.district,
          value: data.attributes?.["district"]?.[0] ?? "",
        },
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
  }, [form, products, logo]);

  useEffect(() => {
    return () => {
      if (logoPreiew) URL.revokeObjectURL(logoPreiew);
    };
  }, []);

  return (
    <div className="w-full flex flex-col gap-4">
      {!viewFlow && (
        <div className="w-full flex gap-4 p-4 flex-wrap justify-between rounded-lg bg-ghostWhite">
          {products.map((product, index) => (
            <div key={index}>
              <CheckBox
                data={product}
                onChange={handleCheckBox}
                labelColor="text-trollyGray"
              />
            </div>
          ))}
        </div>
      )}
      <div className="border border-platinum w-full rounded-2xl p-4 gap-2 md:gap-0 flex flex-col">
        <h5 className="text-liver text-sm font-medium">Company Information</h5>
        <div className="w-full h-full flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="w-full self-end">
              <Input
                props={{ ...form.name, readonly: !canEdit }}
                onChange={handleInput}
              />
            </div>
            <div className="w-full self-end relative z-[100]">
              <SelectInput
                props={{
                  ...form.typeOfPipeLine,
                  options: pipeLineType,
                  editInput: false,
                  readonly: !canEdit,
                }}
                onChange={handleInput}
              />
            </div>
            <div className="w-50 min-w-50 min-h-20 h-20 max-h-20">
              {canEdit ? (
                <div className="w-full h-full relative group">
                  <FileUpload
                    size="logo"
                    onChange={(files) => handleLogo(files[0])}
                    data={fileType}
                    logo={logoPreiew}
                  />
                  {logoError && (
                    <span className="text-xs text-carminePink font-normal mt-2 block">
                      Please upload valid logo
                    </span>
                  )}
                  {(logo || logoPreiew) && (
                    <IconBox
                      action="delete"
                      icon="delete-icon.svg"
                      className={`absolute top-1 right-[55%] hidden group-hover:block`}
                      onClick={deleteLogo}
                    />
                  )}
                </div>
              ) : (
                <div className="h-full w-full flex justify-center items-center text-sm">
                  {logoPreiew ? (
                    <Image
                      src={logoPreiew}
                      width={100}
                      height={80}
                      alt="Logo Preview"
                      className="rounded-md w-25 h-20 max-h-20"
                    />
                  ) : (
                    <div className="w-25 h-20 border border-platinum rounded-md flex justify-center items-center font-semibold bg-ghostWhite text-regentGrey text-sm">
                      {getLogoName(form.name.value ?? "")}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <Input
              props={{ ...form.registerNumber, readonly: !canEdit }}
              onChange={handleInput}
            />
            <DateInput
              props={{ ...form.agreementDate, readonly: !canEdit }}
              onChange={handleInput}
            />
            <Input
              props={{ ...form.gstin, readonly: !canEdit }}
              onChange={handleInput}
            />
          </div>
          <div className="flex gap-4 flex-col md:flex-row w-full">
            <TelInput
              props={{ ...form.phoneNumber, readonly: !canEdit }}
              defaultCountry={defaultCountry}
              onChange={handleInput}
            />
            <Input
              props={{ ...form.mailAddress, readonly: !canEdit }}
              onChange={handleInput}
            />
          </div>
        </div>
      </div>
      <div className="border border-platinum w-full rounded-2xl flex flex-col gap-4 p-4">
        <h5 className="text-liver text-sm font-medium">Address</h5>
        <div className="w-full flex flex-col gap-4 h-full">
          <div className="w-full flex flex-col md:flex-row gap-4">
            <Input
              props={{ ...form.street, readonly: !canEdit }}
              onChange={handleInput}
            />
            <Input
              props={{ ...form.area, readonly: !canEdit }}
              onChange={handleInput}
            />
          </div>
          <div className="w-full flex flex-col md:flex-row gap-4">
            <Input
              props={{ ...form.landmark, readonly: !canEdit }}
              onChange={handleInput}
            />
            <Input
              props={{ ...form.pincode, readonly: !canEdit }}
              onChange={handleInput}
            />
          </div>
          <div className="w-full flex flex-col md:flex-row gap-4">
            <SelectInput
              props={{
                ...form.country,
                editInput: true,
                readonly: !canEdit,
                options: country,
              }}
              onChange={handleInput}
            />
            <SelectInput
              props={{
                ...form.state,
                editInput: true,
                readonly: !canEdit,
                options: state,
              }}
              onChange={handleInput}
            />
            <SelectInput
              props={{
                ...form.district,
                editInput: true,
                readonly: !canEdit,
                options: district,
              }}
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

export default CompanyDetails;
