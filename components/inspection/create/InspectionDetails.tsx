import {
  Input,
  DateInput,
  SelectInput,
  InputWithTag,
} from "../../common/Inputs";
import { getAddress, processInspectionDataKeyandValue } from "@/helpers/helper";
import {
  getLocalStorage,
  isValidGPS,
  isValidPincode,
  setLocalStorage,
} from "@/utils/utils";
import { StepperButtons } from "@/types/button";
import {
  areAllKeyValuesMatched,
  areAllRequiredFieldsFilled,
  extractInspectionDetailsData,
} from "@/helpers/helper";
import { useEffect, useState } from "react";
import {
  InspectionDetailsFormData,
  InspectionPageProps,
} from "@/types/inpection";
import { inspectionService } from "@/services/inspectionService";
import { InspectionPagePropsLegacy } from "@/types/inpection";
import { StepperButton } from "../../common/Buttons";
import { updateStepperButtons } from "@/helpers/helper";
import { useAppContext } from "@/context/AppContext";
import { CustomImageProps } from "@/types/input";
import { ZoneFormData } from "@/types/customer";
import OptimizedDropDown from "@/components/common/OptimizedDropDown";
import Constants from "@/constants/constants";
import { frameData } from "framer-motion";

const InspectionDetails: React.FC<InspectionPageProps> = ({
  createFlow,
  data,
  updatePage = () => {},
  success = () => {}
}) => {
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [showZone, setShowZone] = useState<boolean>(false);
  const { zone, inspectionId } = useAppContext();
  const infoIcon: CustomImageProps = {
    src: "/images/tabler-info-rounded.svg",
    alt: "Info",
    width: 24,
    height: 24,
    className: "w-4 h-4",
  };

  const [buttons, setButtons] = useState<StepperButtons>({
    cancel: {
      loading: false,
      disabled: true,
      label: "Cancel",
      name: "cancel",
    },
    next: { loading: false, disabled: true, label: "Next", name: "next" },
    submit: {
      loading: false,
      disabled: true,
      label: "Submit",
      name: "submit",
    },
  });
  const [details, setDetails] = useState<InspectionDetailsFormData>({
    siteName: {
      name: "siteName",
      label: "Site name",
      value: "",
      error: null,
      required: true,
    },
    inspectedDate: {
      name: "inspectedDate",
      label: "Date",
      value: new Date().toString(),
      error: null,
      required: true,
    },
    gpsCoordinates: {
      name: "gpsCoordinates",
      label: "GPS coordinates",
      value: "",
      error: null,
      required: true,
    },
    address: {
      street: {
        name: "street",
        label: "Street",
        value: "",
        error: null,
        required: true,
      },
      area: {
        name: "area",
        label: "Area",
        value: "",
        error: null,
        required: true,
      },
      landmark: {
        name: "landmark",
        label: "Landmark",
        value: "",
        error: null,
        required: false,
      },
      pincode: {
        name: "pincode",
        label: "Pincode",
        value: "",
        error: null,
        required: true,
      },
      district: {
        name: "district",
        label: "District",
        value: "",
        error: null,
        required: true,
      },
      state: {
        name: "state",
        label: "State",
        value: "",
        error: null,
        required: true,
      },
      country: {
        name: "country",
        label: "Country",
        value: "",
        error: null,
        required: true,
      },
    },
    zone: {
      name: "zone",
      label: "Zone",
      value: "",
      error: null,
      required: false,
    },
  });
  const [form, setForm] = useState<ZoneFormData>({
    zone: {
      name: "zone",
      label: "Choose Zone (Optional)",
      error: null,
      required: false,
      value: details?.zone.value,
      placeholder:
        zone?.length > 0 ? "Select Inspection Zone" : "No Zones Available",
      disabled: zone?.length === 0 || details?.zone.value === "",
      tooltip:
        zone?.length < 0
          ? "Create zones in customer settings to select zones"
          : "",
      readonly: true,
    },
  });
  const handleZoneAction = (action: string) => {
    const selectedZone = zone?.filter((item) => item.value === action);
    handleInput("zone", selectedZone[0].label);
    setForm((prev) => ({
      ...prev,
      zone: {
        ...prev.zone,
        value: selectedZone[0].label,
      },
    }));
    setShowZone(false);
  };

  const handleInput = (key: string, value: string) => {
    setDetails((prev) => {
      let error = null;
      if (
        (key in prev.address &&
          prev.address[key as keyof typeof prev.address]?.required) ||
        (key in prev &&
          prev[key as keyof InspectionDetailsFormData] &&
          typeof prev[key as keyof InspectionDetailsFormData] === "object" &&
          "required" in prev[key as keyof InspectionDetailsFormData] &&
          (prev[key as keyof InspectionDetailsFormData] as any).required ===
            true)
      ) {
        error = value.trim() === "" ? "This field is required." : null;
      }

      return updateDetailsState(prev, key, value, error);
    });
    if (key === "gpsCoordinates") {
      setDetails((prev) =>
        updateDetailsState(
          prev,
          key,
          value,
          isValidGPS(value) ? null : "Invalid coordinates."
        )
      );
    }
    if (key === "pincode") {
      setDetails((prev) =>
        updateDetailsState(
          prev,
          key,
          value,
          isValidPincode(value) ? null : "Invalid pincode."
        )
      );
    }
    if (key === "zone") {
      setDetails((prev) => updateDetailsState(prev, key, value, null));
    }
  };

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      zone: {
        ...prev.zone,
        value: details?.zone.value,
        placeholder:
          zone?.length > 0 ? "Select Inspection Zone" : "No Zones Available",
        disabled: zone?.length === 0,
        tooltip:
          zone?.length < 1
            ? "Create Zones in Customer settings to select zones"
            : "",
      },
    }));
  }, [zone, details]);

  const updateDetailsState = (
    prev: InspectionDetailsFormData,
    key: string,
    value: string,
    error: string | null
  ) => {
    return {
      ...prev,
      ...(key in prev.address
        ? {
            address: {
              ...prev.address,
              [key]: {
                ...prev.address[key as keyof typeof prev.address],
                value,
                error,
              },
            },
          }
        : {
            [key]: {
              ...prev[key as keyof InspectionDetailsFormData],
              value,
              error,
            },
          }),
    };
  };

  const getInspection = async (id: string) => {
    const response = await inspectionService.getInspectionById(id);
    if (response.status === 200) {
      processInspectionDataKeyandValue(response.data, (key, value) =>
        setDetails((prev) => updateDetailsState(prev, key, value, null))
      );
    }
  };

  const fetchLocation = async (key: string, pincode: string) => {
    handleInput(key, pincode);
    if (isValidPincode(pincode)) {
      const address = await getAddress(pincode);
      setDistricts(address.district ? [address.district] : []);
      setStates(address.state ? [address.state] : []);
      setCountries(address.country ? [address.country] : []);
    } else {
      setDistricts([]);
      setStates([]);
      setCountries([]);
    }
  };

  const handleSubmit = async () => {
    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "next", values: { disabled: true, loading: true } },
        { key: "submit", values: { disabled: true, loading: true } },
      ])
    );
    const formData = extractInspectionDetailsData(details);
    if (createFlow) {
      const inspectId = getLocalStorage(Constants.INSPECTION_ID);
      const response = inspectId
        ? await inspectionService.updateInspection(inspectionId, formData)
        : await inspectionService.createInspection(formData);
      if (response.status === 201 || response.status === 200) {
        !inspectId && setLocalStorage("IID", response.data.id);
        setLocalStorage("COMPIID", JSON.stringify([1]));
        updatePage(2, false);
      }
    } else {
      const response = await inspectionService.updateInspection(
        inspectionId,
        formData
      );
      if (response.status === 200) {
        success();
      }
    }
    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "next", values: { disabled: false, loading: false } },
        { key: "submit", values: { loading: false } },
      ])
    );
  };

  useEffect(() => {
    if (
      areAllRequiredFieldsFilled(details) &&
      areAllKeyValuesMatched(details, "error", null)
    ) {
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
  }, [details]);

  useEffect(() => {
    if (districts.length > 0) {
      setDetails((prev) =>
        updateDetailsState(prev, "district", districts[0], null)
      );
    }
    if (states.length > 0) {
      setDetails((prev) => updateDetailsState(prev, "state", states[0], null));
    }
    if (countries.length > 0) {
      setDetails((prev) =>
        updateDetailsState(prev, "country", countries[0], null)
      );
    }
  }, [districts, states, countries]);

  useEffect(() => {
    if (!createFlow && data) {
      processInspectionDataKeyandValue(data, (key, value) =>
        setDetails((prev) => updateDetailsState(prev, key, value, null))
      );
    }
  }, [createFlow, data]);

  useEffect(() => {
    const IID = getLocalStorage(Constants.INSPECTION_ID);
    if (IID) {
      getInspection(IID);
    }
  }, []);
  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex flex-col gap-4 p-4 rounded-2xl border border-platinum">
        <h5 className="text-liver text-sm font-medium">Site Info</h5>
        <div
          className={`flex gap-4 w-full flex-wrap ${
            createFlow && "md:flex-nowrap"
          }`}
        >
          <Input props={details.siteName} onChange={handleInput} />
          <div>
            <DateInput
              props={details.inspectedDate}
              onChange={(key, value) => handleInput(key, value)}
              maxDate={new Date()}
            />
          </div>
          <Input
            props={details.gpsCoordinates}
            onChange={(key, value) => handleInput(key, value)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 p-4 w-full rounded-2xl border border-platinum">
        <h5 className="text-liver text-sm font-medium">Address</h5>
        <div
          className={`flex flex-col gap-6 w-full flex-wrap ${
            createFlow && " md:flex-nowrap"
          }`}
        >
          <div
            className={`flex gap-4 w-full flex-wrap ${
              createFlow && "md:flex-nowrap"
            }`}
          >
            <Input props={details.address.street} onChange={handleInput} />
            <Input props={{ ...details.address.area }} onChange={handleInput} />
          </div>
          <div
            className={`w-full flex gap-4 flex-wrap ${
              createFlow && "md:flex-nowrap"
            }`}
          >
            <Input props={details.address.landmark} onChange={handleInput} />
            <Input
              props={{
                ...details.address.pincode,
                value: details.address.pincode.value?.toString(),
              }}
              onChange={fetchLocation}
            />
          </div>
          <div
            className={`w-full flex gap-4 flex-wrap ${
              createFlow && " md:flex-nowrap"
            }`}
          >
            <SelectInput
              props={{
                ...details.address.district,
                options: districts,
                editInput: true,
              }}
              onChange={handleInput}
            />

            <SelectInput
              props={{
                ...details.address.state,
                options: states,
                editInput: true,
              }}
              onChange={handleInput}
            />
          </div>
          <div
            className={`w-full flex gap-4 flex-wrap ${
              createFlow && "md:flex-nowrap"
            }`}
          >
            <SelectInput
              props={{
                ...details.address.country,
                options: countries,
                editInput: true,
              }}
              onChange={handleInput}
            />
            <div className={`w-full h-fit flex flex-col gap-1 relative`}>
              <InputWithTag
                props={{ ...form.zone, tag: "Zone" }}
                onChange={handleInput}
                labelIcon={true}
                labelIconContent={infoIcon}
                onClick={setShowZone}
              />
              {zone?.length > 0 && (
                <OptimizedDropDown
                  options={zone}
                  show={showZone}
                  setShow={setShowZone}
                  onChange={(_, action) => handleZoneAction(action)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {createFlow && (
        <div className="flex justify-end gap-4">
          {buttons.next && (
            <StepperButton data={buttons.next} onClick={handleSubmit} />
          )}
        </div>
      )}
      {!createFlow && (
        <div className="flex justify-end">
          {buttons.submit && (
            <StepperButton data={buttons.submit} onClick={handleSubmit} />
          )}
        </div>
      )}
    </div>
  );
};

export default InspectionDetails;
