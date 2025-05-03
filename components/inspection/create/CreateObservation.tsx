import { StepperButton } from "@/components/common/Buttons";
import DirectionRangePicker from "@/components/common/DirectionRanagePicker";
import FileUpload from "@/components/common/FileUpload";
import {
  Input,
  InputWithSelect,
  SelectInput,
} from "@/components/common/Inputs";
import { useAppContext } from "@/context/AppContext";
import {
  areAllKeyValuesMatched,
  areAllRequiredFieldsFilled,
  extractObservationImageData,
  updateStepperButtons,
} from "@/helpers/helper";
import { assetService } from "@/services/assetService";
import { StepperButtons } from "@/types/button";
import { FileUploadData } from "@/types/common";
import { DefectImageData, ObservationFormData } from "@/types/inpection";
import { isNumber, isValidTimeStamp } from "@/utils/utils";
import { useEffect, useState } from "react";

interface CreateObservationProps {
  time: number;
  videoId: string;
  success?: () => void;
}

const CreateObservation: React.FC<CreateObservationProps> = ({
  time,
  videoId,
  success = () => {},
}) => {
  const createObservationForm = (): ObservationFormData => ({
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
    direction: {
      name: "direction",
      value: "",
      label: "Direction",
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
  const [form, setForm] = useState<ObservationFormData>(
    createObservationForm()
  );
  const [image, setImage] = useState<File | null>(null);
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
  const [fileType, setFileType] = useState<FileUploadData>({
    imgUrl: "upload-image.svg",
    multiple: false,
    format: { label: "JPEG, JPG, PNG, WebP", type: ".jpeg, .jpg, .png, .webp" },
    type: "image",
  });
  const [imagePreview, setImagePreview] = useState<string | undefined>();

  const handleInput = (key: string, value: string) => {
    setForm((prev) => {
      let error = null;
      const field = prev[key as keyof ObservationFormData];
      const trimmedValue = value.trim();
      if (field.required) {
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

      return updateFormState(prev, key, value, error);
    });
  };

  const updateFormState = (
    prev: ObservationFormData,
    key: string,
    value: string,
    error: string | null
  ) => {
    return {
      ...prev,
      [key]: {
        ...prev[key as keyof ObservationFormData],
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
    if (image) {
      const response = await assetService.uploadFile(
        inspectionId,
        "image",
        image,
        formData,
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
    if (image) {
      const extractedData = extractObservationImageData(form, videoId);
      if (extractedData) {
        uploadImage(extractedData);
      }
    }
  };

  const fileUpload = (files: File[], reset: boolean) => {
    setImage(files[0]);
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

  const getFormFields = async () => {
    const response = await assetService.getImageDefectTypes();
    if (response.status === 200) {
      setDirections(response.data.directions);
    }
  };

  useEffect(() => {
    if (image) setImagePreview(URL.createObjectURL(image));
  }, [image]);

  useEffect(() => {
    if (
      areAllRequiredFieldsFilled(form) &&
      areAllKeyValuesMatched(form, "error", null) &&
      image
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
    setForm(createObservationForm());
    setImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(undefined);
  }, [time]);

  useEffect(() => {
    getFormFields();

    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="w-full flex flex-col md:flex-row gap-4">
        <div className="w-full">
          {image && imagePreview ? (
            <div className="max-h-40 h-full rounded-lg w-full">
              <img
                src={imagePreview}
                className="rounded-lg w-full h-full object-contain"
                alt="Captured Image"
              />
            </div>
          ) : (
            <div className="w-full h-fit">
              <FileUpload
                size="large"
                onChange={(files) => fileUpload(files, false)}
                data={fileType}
              />
            </div>
          )}
        </div>
      </div>
      <div className="w-full flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Input props={form.title} onChange={handleInput} />
          <Input props={form.description} onChange={handleInput} />
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <Input props={form.timeStamp} onChange={handleInput} />
          <InputWithSelect
            props={{ ...form.distance, options: ["M"] }}
            onChange={handleInput}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <SelectInput
            props={{ ...form.direction, options: directions, editInput: false }}
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

export default CreateObservation;
