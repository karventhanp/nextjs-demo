import { ActionButton, StepperButton } from "@/components/common/Buttons";
import DirectionRangePicker from "@/components/common/DirectionRanagePicker";
import {
  Input,
  InputWithSelect,
  SelectInput,
} from "@/components/common/Inputs";
import { useAppContext } from "@/context/AppContext";
import {
  areAllKeyValuesMatched,
  areAllRequiredFieldsFilled,
  extractImageMetaData,
  getValidUrl,
  updateActionButton,
  updateStepperButtons,
} from "@/helpers/helper";
import { assetService } from "@/services/assetService";
import { inspectionService } from "@/services/inspectionService";
import { ActionButtons, StepperButtons } from "@/types/button";
import {
  DefectFieldTypes,
  DefectFormData,
  ObservationFormData,
} from "@/types/inpection";
import { ImageDefectMeta } from "@/types/response";
import { isNumber, isValidTimeStamp } from "@/utils/utils";
import { useEffect, useState } from "react";

interface EditDefectProps {
  image: ImageDefectMeta;
  success?: () => void;
}

const EditDefect: React.FC<EditDefectProps> = ({
  image,
  success = () => {},
}) => {
  const createDefectForm = (
    title: string,
    description: string,
    timeStamp: string,
    distance: string,
    defect: string,
    direction: string,
    severity: string,
    clockStart: string,
    clockEnd: string
  ): DefectFormData => ({
    title: {
      name: "title",
      value: title,
      label: "Title",
      required: true,
      error: null,
    },
    description: {
      name: "description",
      value: description,
      label: "Description",
      required: true,
      error: null,
    },
    timeStamp: {
      name: "timeStamp",
      value: timeStamp,
      label: "Time Stamp",
      required: true,
      error: null,
    },
    distance: {
      name: "distance",
      value: distance,
      label: "Distance",
      required: true,
      error: null,
    },
    defect: {
      name: "defect",
      value: defect,
      label: "Defect",
      required: true,
      error: null,
    },
    direction: {
      name: "direction",
      value: direction,
      label: "Direction",
      required: true,
      error: null,
    },
    severity: {
      name: "severity",
      value: severity,
      label: "Severity",
      required: true,
      error: null,
    },
    clockStart: {
      name: "clockStart",
      value: clockStart,
      label: "Clock Start",
      required: true,
      error: null,
    },
    clockEnd: {
      name: "clockEnd",
      value: clockEnd,
      label: "Clock End",
      required: true,
      error: null,
    },
  });
  const createObservationForm = (
    title: string,
    description: string,
    timeStamp: string,
    distance: string,
    direction: string,
    clockStart: string,
    clockEnd: string
  ): ObservationFormData => ({
    title: {
      name: "title",
      value: title,
      label: "Title",
      required: true,
      error: null,
    },
    description: {
      name: "description",
      value: description,
      label: "Description",
      required: true,
      error: null,
    },
    timeStamp: {
      name: "timeStamp",
      value: timeStamp,
      label: "Time Stamp",
      required: true,
      error: null,
    },
    distance: {
      name: "distance",
      value: distance,
      label: "Distance",
      required: true,
      error: null,
    },
    direction: {
      name: "direction",
      value: direction,
      label: "Direction",
      required: true,
      error: null,
    },
    clockStart: {
      name: "clockStart",
      value: clockStart,
      label: "Clock Start",
      required: true,
      error: null,
    },
    clockEnd: {
      name: "clockEnd",
      value: clockEnd,
      label: "Clock End",
      required: true,
      error: null,
    },
  });
  const [form, setForm] = useState<DefectFormData | ObservationFormData>();
  const [buttons, setButtons] = useState<StepperButtons>({
    submit: { disabled: true, label: "Save", name: "submit", loading: false },
    cancel: {
      disabled: false,
      label: "Cancel",
      name: "cancel",
      loading: false,
    },
  });
  const [defectFields, setDefectFields] = useState<DefectFieldTypes[]>([]);
  const [directions, setDirections] = useState<string[]>([]);
  const [clock, setClock] = useState<string[]>([
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ]);
  const [defectCode, setDefectCode] = useState<string | undefined>();
  const { setShowOptimizedOffCanvas, userId, allowedActions } = useAppContext();
  const [actions, setActions] = useState<ActionButtons>();

  const getFormFields = async () => {
    const response = await assetService.getImageDefectTypes();
    if (response.status === 200) {
      setDefectFields(response.data.defects);
      setDirections(response.data.directions);
    }
  };

  const getSeverity = (name: string) => {
    const data = defectFields.find((item) => item.name === name);
    if (!data) return "";
    return data.severity;
  };

  const handleInput = (key: string, value: string) => {
    setForm((prev) => {
      if (!prev) return prev;
      let error = null;
      const field = key in prev ? prev[key as keyof typeof prev] : undefined;
      const trimmedValue = value.trim();
      if (field && field.required) {
        if (key === "distance") {
          error = isNumber(value) ? null : "Invalid distance.";
        } else if (key === "timeStamp") {
          error = isValidTimeStamp(value) ? null : "Format (hh:mm:ss)";
        } else {
          error = trimmedValue ? null : "This field is required.";
        }
      } else if (trimmedValue) {
        if (key === "distance") {
          error = isNumber(value) ? null : "Invalid distance.";
        } else if (key === "timeStamp") {
          error = isValidTimeStamp(value) ? null : "Format (hh:mm:ss)";
        }
      }

      if (key in prev) {
        return updateFormState(
          prev as DefectFormData | ObservationFormData,
          key as keyof typeof prev,
          value,
          error
        );
      }

      return prev;
    });
  };

  const handleSubmit = async () => {
    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "submit", values: { disabled: true, loading: true } },
      ])
    );
    let defectId;
    if (form) {
      if ("defect" in form)
        defectId = defectFields.find(
          (defect) => defect.name === form.defect.value
        )?.id;
      const extractedData = extractImageMetaData(form, defectId);
      const response = await inspectionService.updateImageMeta(
        image.imgId,
        extractedData
      );
      if (response.status === 200) {
        success();
        setShowOptimizedOffCanvas(false);
      }
    }

    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "submit", values: { loading: false } },
      ])
    );
  };

  const updateFormState = <T extends DefectFormData | ObservationFormData>(
    prev: T,
    key: keyof T,
    value: string,
    error: string | null
  ) => {
    return {
      ...prev,
      [key]: {
        ...(prev[key] as { value: string; error: string | null }),
        value,
        error,
      },
    };
  };

  const handleDirectionPicker = (key: "start" | "end", value: number) => {
    setForm((prev) =>
      updateFormState(
        prev as DefectFormData | ObservationFormData,
        key === "start" ? "clockStart" : "clockEnd",
        value.toString(),
        null
      )
    );
  };

  const deleteImage = async () => {
    setActions((prev) =>
      updateActionButton(prev || {}, [
        { key: "delete", values: { disabled: true, loading: true } },
      ])
    );
    const response = await inspectionService.deleteImage(image.imgId);
    if (response.status === 200) {
      success();
      setShowOptimizedOffCanvas(false);
    }
    setActions((prev) =>
      updateActionButton(prev || {}, [
        { key: "delete", values: { disabled: false, loading: false } },
      ])
    );
  };

  useEffect(() => {
    if (form && "defect" in form) {
      const defectForm = form as DefectFormData;
      const defectName = defectForm.defect.value;
      if (defectName) {
        setForm((prev) =>
          updateFormState(
            prev as DefectFormData,
            "severity",
            getSeverity(defectName),
            null
          )
        );
        const defectCode = defectFields.find(
          (defect) => defect.name === defectName
        )?.code;
        setDefectCode(defectCode);
      }
    }
  }, [form && "defect" in form && form.defect]);

  useEffect(() => {
    if (form) {
      if (
        areAllRequiredFieldsFilled(form) &&
        areAllKeyValuesMatched(form, "error", null)
      ) {
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
    }
  }, [form, image]);

  useEffect(() => {
    if (image) {
      if (image.defect) {
        setForm(
          createDefectForm(
            image.title,
            image.description,
            image.timestamp,
            image.distance,
            image.defect.name,
            image.direction??"",
            image.defect.severity,
            image.clock ? image.clock.split(",")[0] : "0",
            image.clock ? image.clock.split(",")[1] : "0",
          )
        );
        const defectCode = defectFields.find(
          (defect) => defect.name === image.defect.name
        )?.code;
        setDefectCode(defectCode);
      } else {
        setForm(
          createObservationForm(
            image.title,
            image.description,
            image.timestamp,
            image.distance,
            image.direction??"",
            image.clock ? image.clock.split(",")[0] : "0",
            image.clock ? image.clock.split(",")[1] : "0",
          )
        );
      }
    }
  }, [image]);

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
    getFormFields();
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {form && image && (
        <>
          <div className="w-full flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2">
              {image ? (
                <img
                  src={getValidUrl(image.imageUrl, userId)}
                  className="h-full rounded-lg"
                  alt="Captured Image"
                />
              ) : (
                <div className="w-full h-full flex justify-center items-center text-liver font-normal text-sm border rounded-lg border-platinum">
                  No preview available
                </div>
              )}
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              <Input props={form.title} onChange={handleInput} />
              <Input props={form.description} onChange={handleInput} />
            </div>
          </div>
          <div className="w-full flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Input props={{ ...form.timeStamp }} onChange={handleInput} />
              <InputWithSelect
                props={{ ...form.distance, options: ["M"] }}
                onChange={handleInput}
              />
            </div>
            {image.defect && "defect" in form && (
              <SelectInput
                props={{
                  ...form.defect,
                  options: defectFields.map((defect) => defect.name),
                  editInput: false,
                }}
                tag={true}
                tagValue={defectCode}
                onChange={handleInput}
              />
            )}
            <div className="flex flex-col md:flex-row gap-4">
              <SelectInput
                props={{
                  ...form.direction,
                  options: directions,
                  editInput: false,
                }}
                onChange={handleInput}
              />
              {image.defect && "severity" in form && (
                <Input
                  props={{ ...form.severity, disabled: true }}
                  onChange={handleInput}
                />
              )}
            </div>
            <div className="border w-full border-platinum rounded-lg p-4 flex flex-col gap-4">
              <label className="text-sm text-liver">Clock</label>
              <div className="h-50 w-50 m-auto">
                <DirectionRangePicker
                  start={parseFloat(form.clockStart.value ?? "0")}
                  end={parseFloat(form.clockEnd.value ?? "0")}
                  ringWidth={23}
                  circleRadius={90}
                  onChange={handleDirectionPicker}
                />
              </div>
              <div className="w-full flex flex-col sm:flex-row gap-4">
                <SelectInput
                  props={{
                    ...form.clockStart,
                    options: clock,
                    editInput: false,
                  }}
                  onChange={handleInput}
                />
                <SelectInput
                  props={{ ...form.clockEnd, options: clock, editInput: false }}
                  onChange={handleInput}
                />
              </div>
            </div>
          </div>
          <div className="flex w-full gap-4 justify-between h-full items-end">
            <div>
              {actions && actions.delete && (
                <ActionButton data={actions.delete} onClick={deleteImage} />
              )}
            </div>
            <div className="flex gap-4">
              {buttons.cancel && (
                <StepperButton
                  data={buttons.cancel}
                  onClick={() => setShowOptimizedOffCanvas(false)}
                />
              )}
              {buttons.submit && (
                <StepperButton data={buttons.submit} onClick={handleSubmit} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EditDefect;
