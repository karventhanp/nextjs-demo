import { StepperButton } from "@/components/common/Buttons";
import DirectionRangePicker from "@/components/common/DirectionRanagePicker";
import {
  Input,
  InputWithSelect,
  SelectInput
} from "@/components/common/Inputs";
import { useAppContext } from "@/context/AppContext";
import {
  areAllKeyValuesMatched,
  areAllRequiredFieldsFilled,
  extractDefectImageData,
  updateStepperButtons,
} from "@/helpers/helper";
import { assetService } from "@/services/assetService";
import { StepperButtons } from "@/types/button";
import {
  CreateDefectProps,
  DefectFieldTypes,
  DefectFormData,
  DefectImageData,
} from "@/types/inpection";
import { isNumber } from "@/utils/utils";
import { useEffect, useState } from "react";

const CreateDefect: React.FC<CreateDefectProps> = ({
  data,
  videoId,
  success = () => {},
}) => {
  const createDefectForm = (): DefectFormData => ({
    title: {
      name: "title",
      value: "",
      label: "Title",
      required: true,
      error: null,
    },
    description: {
      name: "description",
      value: "",
      label: "Description",
      required: true,
      error: null,
    },
    timeStamp: {
      name: "timeStamp",
      value: "",
      label: "Time Stamp",
      required: true,
      error: null,
    },
    distance: {
      name: "distance",
      value: "",
      label: "Distance",
      required: true,
      error: null,
    },
    defect: {
      name: "defect",
      value: "",
      label: "Defect",
      required: true,
      error: null,
    },
    direction: {
      name: "direction",
      value: "",
      label: "Direction",
      required: true,
      error: null,
    },
    severity: {
      name: "severity",
      value: "",
      label: "Severity",
      required: true,
      error: null,
    },
    clockStart: {
      name: "clockStart",
      value: "1",
      label: "Clock Start",
      required: true,
      error: null,
    },
    clockEnd: {
      name: "clockEnd",
      value: "2",
      label: "Clock End",
      required: true,
      error: null,
    },
  });
  const [form, setForm] = useState<DefectFormData>(createDefectForm());
  const { setShowOptimizedOffCanvas, inspectionId } = useAppContext();
  const [buttons, setButtons] = useState<StepperButtons>({
    submit: { disabled: true, label: "Submit", name: "submit", loading: false },
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

  const getFormFields = async () => {
    const response = await assetService.getImageDefectTypes();
    if (response.status === 200) {
      setDefectFields(response.data.defects);
      setDirections(response.data.directions);
    }
  };

  const handleInput = (key: string, value: string) => {
    setForm((prev) => {
      let error = null;
      const field = prev[key as keyof DefectFormData];
      const trimmedValue = value.trim();
      if (field.required) {
        if (key === "distance") {
          error = isNumber(value) ? null : "Invalid distance.";
        } else {
          error = trimmedValue ? null : "This field is required.";
        }
      } else if (trimmedValue) {
        if (key === "distance") {
          error = isNumber(value) ? null : "Invalid distance.";
        }
      }

      return updateFormState(prev, key, value, error);
    });
  };

  const getSeverity = (name: string) => {
    const data = defectFields.find((item) => item.name === name);
    if (!data) return "";
    return data.severity;
  };

  const updateFormState = (
    prev: DefectFormData,
    key: string,
    value: string,
    error: string | null
  ) => {
    return {
      ...prev,
      [key]: {
        ...prev[key as keyof DefectFormData],
        value,
        error,
      },
    };
  };

  const uploadImage = async (formData: DefectImageData) => {
    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "submit", values: { disabled: true, loading: true } },
      ])
    );
    const { file, ...otherMeta } = formData;
    if (file) {
      const response = await assetService.uploadFile(
        inspectionId,
        "image",
        file,
        otherMeta,
        () => {}
      );
      if (response.status === 200) {
        setShowOptimizedOffCanvas(false);
        success();
      }
    }
    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "submit", values: { disabled: false, loading: false } },
      ])
    );
  };

  const handleSubmit = () => {
    if (data && data.image) {
      const defectId = defectFields.find(
        (defect) => defect.name === form.defect.value
      )?.id;
      const extractedData = extractDefectImageData(
        form,
        data.image,
        defectId ?? "",
        videoId
      );
      if (extractedData) {
        uploadImage(extractedData);
      }
    }
  };

  const handleDirectionPicker = (key: "start" | "end", value: number) => {
    setForm((prev) =>
      updateFormState(
        prev,
        key === "start" ? "clockStart" : "clockEnd",
        value.toString(),
        null
      )
    );
  };

  useEffect(() => {
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
  }, [form]);

  useEffect(() => {
    const defectName = form.defect.value;
    if (defectName) {
      setForm((prev) =>
        updateFormState(prev, "severity", getSeverity(defectName), null)
      );
      const defectCode = defectFields.find(
        (defect) => defect.name === defectName
      )?.code;
      setDefectCode(defectCode);
    }
  }, [form.defect]);

  useEffect(() => {
    let initialForm = createDefectForm();
    if (data?.timeStamp) {
      initialForm = updateFormState(
        initialForm,
        "timeStamp",
        data.timeStamp,
        null
      );
    }
    setForm(initialForm);
    setDefectCode("");
  }, [data]);

  useEffect(() => {
    getFormFields();
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="w-full flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          {data?.image ? (
            <img
              src={data.image}
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
          <Input
            props={{ ...form.timeStamp, readonly: true, disabled: true }}
            onChange={handleInput}
          />
          <InputWithSelect
            props={{ ...form.distance, options: ["M"] }}
            onChange={handleInput}
          />
        </div>
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
        <div className="flex flex-col md:flex-row gap-4">
          <SelectInput
            props={{ ...form.direction, options: directions, editInput: false }}
            onChange={handleInput}
          />
          <Input
            props={{ ...form.severity, disabled: true }}
            onChange={handleInput}
          />
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
              props={{ ...form.clockStart, options: clock, editInput: false }}
              onChange={handleInput}
            />
            <SelectInput
              props={{ ...form.clockEnd, options: clock, editInput: false }}
              onChange={handleInput}
            />
          </div>
        </div>
      </div>
      <div className="flex w-full gap-4 justify-end h-full items-end">
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
  );
};

export default CreateDefect;
