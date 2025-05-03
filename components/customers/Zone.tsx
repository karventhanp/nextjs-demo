import { useEffect, useState } from "react";
import { StepperButton } from "../common/Buttons";
import { StepperButtons } from "@/types/button";
import { InputWithTag } from "../common/Inputs";
import { CustomerProps, ZoneFormData } from "@/types/customer";
import Image from "next/image";
import { getCustomerId, updateStepperButtons } from "@/helpers/helper";
import { inspectionService } from "@/services/inspectionService";
import { setLocalStorage } from "@/utils/utils";
import { Zones } from "@/types/inpection";
import { useAppContext } from "@/context/AppContext";

const Zone: React.FC<CustomerProps> = ({
  callback = () => {},
  viewFlow,
  viewData,
  canEdit,
}) => {
  const [buttons, setButtons] = useState<StepperButtons>({
    cancel: {
      loading: false,
      disabled: true,
      label: "Cancel",
      name: "cancel",
    },
    skip: { loading: false, disabled: false, label: "Skip", name: "skip" },
    next: { loading: false, disabled: false, label: "Next", name: "next" },
    submit: {
      loading: false,
      disabled: false,
      label: "Create",
      name: "submit",
    },
  });
  const [form, setForm] = useState<ZoneFormData>({
    zone: {
      name: "zone",
      label: "Set Up Zones",
      error: null,
      required: false,
      value: "",
    },
  });
  const [zones, setZones] = useState<string[]>([]);
  const { isCustomerOnboarding, customerId } = useAppContext();
  const [isZoneCreated, setIsZoneCreated] = useState<boolean>(false);

  const handleInput = (key: string, value: string) => {
    setForm((prev) => updateFormState(prev, key, value, null));
  };

  const updateFormState = (
    prev: ZoneFormData,
    key: string,
    value: string,
    error: string | null
  ) => {
    return {
      ...prev,
      [key]: {
        ...prev[key as keyof ZoneFormData],
        value,
        error,
      },
    };
  };

  const getZones = async () => {
    const response = await inspectionService.getZones(
      isCustomerOnboarding ? undefined : customerId
    );
    if (response.status === 200) {
      setIsZoneCreated(true);
      setZones(response.data.zones);
    }
  };

  const removeZone = async (id: number) => {
    if (viewFlow) {
      const zone = zones.filter((_, index) => index === id);
      if (zone) {
        const response = await inspectionService.deleteZone(
          zone,
          isCustomerOnboarding ? undefined : customerId
        );
        if (response.status === 200) {
          getZones();
          callback(200, "success");
        }
      }
    } else {
      setZones((prev) => prev.filter((_, index) => index !== id));
    }
  };

  const addZone = async () => {
    if (viewFlow) {
      setButtons((prev) =>
        updateStepperButtons(prev, [
          { key: "submit", values: { disabled: true, loading: true } },
        ])
      );
      if (form.zone.value) {
        const response = isZoneCreated
          ? await inspectionService.updateZone(
              [form.zone.value],
              isCustomerOnboarding ? undefined : customerId
            )
          : await inspectionService.createZone([form.zone.value], customerId);
        if (response.status === 200 || response.status === 201) {
          callback(200, "success");
        }
      }
    } else {
      setZones((prev) => (form.zone.value ? [...prev, form.zone.value] : prev));
    }
    setForm((prev) => updateFormState(prev, "zone", "", null));
    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "submit", values: { disabled: false, loading: false } },
      ])
    );
  };

  const createZone = async () => {
    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "next", values: { disabled: true, loading: true } },
      ])
    );
    if (zones.length > 0) {
      const response = await inspectionService.createZone(zones, undefined);
      if (response.status) {
        setLocalStorage("COMSTE", JSON.stringify([1, 2]));
        callback(200, "3");
      }
    }
    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "next", values: { disabled: false, loading: false } },
      ])
    );
  };

  useEffect(() => {
    if (viewFlow && viewData) {
      const data = viewData as Zones;
      data.length > 0 ? setIsZoneCreated(true) : setIsZoneCreated(false);
      setZones(data);
    }
  }, [viewData]);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {!viewFlow && (
        <div className="flex items-center gap-1">
          <h5 className="text-smokyBlack font-medium text-base">Zones</h5>{" "}
          <span className="text-liver text-xs font-normal">(optional)</span>
        </div>
      )}
      <div className="border border-platinum rounded-2xl p-4 flex flex-col gap-4">
        <div className="flex gap-4 items-center flex-wrap md:flex-nowrap">
          <div className="w-full md:w-fit">
            <InputWithTag
              props={{ ...form.zone, tag: "Zone" }}
              onChange={handleInput}
            />
          </div>
          <div className="flex self-end justify-end w-full md:w-fit">
            {buttons.submit && (
              <StepperButton data={buttons.submit} onClick={addZone} />
            )}
          </div>
        </div>
        {zones.length > 0 ? (
          <div className="flex gap-4 flex-wrap">
            {zones.map((zone, index) => (
              <div
                className="flex justify-between w-fit gap-2 items-center border border-primary rounded-2xl p-2"
                key={index}
              >
                <label className="text-smokyBlack text-sm font-normal">
                  {zone}
                </label>
                <Image
                  src="/images/close-black.svg"
                  width={18}
                  height={18}
                  className="cursor-pointer"
                  alt="Remove Zone"
                  onClick={() => removeZone(index)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-liver font-normal text-center">
            No zones found
          </div>
        )}
      </div>
      {!viewFlow && (
        <div className="flex justify-end gap-4">
          {buttons.cancel && (
            <StepperButton data={buttons.cancel} onClick={() => {}} />
          )}
          {zones.length === 0 && buttons.skip && (
            <StepperButton
              data={buttons.skip}
              onClick={() => callback(200, "3")}
            />
          )}
          {zones.length !== 0 && buttons.next && (
            <StepperButton data={buttons.next} onClick={createZone} />
          )}
        </div>
      )}
    </div>
  );
};

export default Zone;
