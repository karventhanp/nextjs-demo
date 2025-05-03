import { useEffect, useMemo, useState } from "react";
import { FileUploadData } from "@/types/common";
import { StepperButtons } from "@/types/button";
import { StepperButton } from "@/components/common/Buttons";
import Image from "next/image";
import {
  Input,
  SelectInput,
  TextAreaInput,
  InputWithSelect,
  TabToggleInput,
} from "@/components/common/Inputs";
import {
  getLocalStorage,
  isNumber,
  isValidTimeStamp,
  setLocalStorage,
} from "@/utils/utils";
import { assetService } from "@/services/assetService";
import {
  ObservationFormImageData,
  ImageFormMetaData,
  DefectFieldTypes,
  InspectionPagePropsLegacy,
} from "@/types/inpection";
import {
  areAllKeyValuesMatched,
  areAllRequiredFieldsFilledForObservationImage,
  extractInspectionObservationImageData,
  updateStepperButtons,
} from "@/helpers/helper";
import FileUpload from "@/components/common/FileUpload";
import { TabToggleInputData } from "@/types/input";
import { useAppContext } from "@/context/AppContext";
import { VideosMetaData } from "@/types/response";
import { Field } from "@/types/input";

const UploadImage: React.FC<InspectionPagePropsLegacy> = ({
  updatePage = () => {},
  viewData,
  viewFlow,
  success = () => {},
  cancel = () => {},
}) => {
  const [fileType, setFileType] = useState<FileUploadData>({
    imgUrl: "upload-image.svg",
    multiple: true,
    format: { label: "JPEG, JPG, PNG, WebP", type: ".jpeg, .jpg, .png, .webp" },
    type: "image",
  });
  const createToggleInput = (imageIndex: number) => ({
    image: imageIndex,
    form: {
      active: 1,
      label: "Category",
      required: true,
      options: [
        { id: 1, name: "Defect", readonly: false },
        { id: 2, name: "Observation", readonly: false },
      ],
    },
  });
  const [toggleForm, setToggleForm] = useState<
    { image: number; form: TabToggleInputData }[]
  >([]);
  const [files, setFiles] = useState<File[]>([]);
  const [buttons, setButtons] = useState<StepperButtons>({
    back: { disabled: true, label: "Back", name: "back", loading: false },
    skip: { disabled: false, label: "Skip", name: "skip", loading: false },
    next: { disabled: true, label: "Next", name: "next", loading: false },
    more: { disabled: false, label: "Add more", name: "more", loading: false },
    submit: { disabled: true, label: "Submit", name: "submit", loading: false },
    cancel: {
      disabled: false,
      label: "Cancel",
      name: "cancel",
      loading: false,
    },
  });
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [form, setForm] = useState<
    { file: File | null; data: ObservationFormImageData }[]
  >([]);
  const [videos, setVideos] = useState<VideosMetaData[]>([]);
  const [defectFieldData, setDefectFieldData] = useState<DefectFieldTypes[]>(
    []
  );
  const [units, setUnits] = useState<string[]>(["M"]);
  const [defectTypes, setDefectTypes] = useState<string[]>([]);
  const [directions, setDirections] = useState<string[]>([]);
  const [videoNames, setVideoNames] = useState<string[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<
    { image: number; meta: { unit: string; index: number }[] }[]
  >([]);
  // const [observation, setObservation] = useState<number[]>([]);
  const { inspectionId } = useAppContext();

  const createImageMeta = () => ({
    distance: {
      label: "Distance",
      error: null,
      name: "distance",
      required: true,
      value: "",
    },
    direction: {
      label: "Direction",
      error: null,
      name: "direction",
      required: true,
      value: "",
    },
    defectTypeId: {
      label: "Defect",
      error: null,
      name: "defectTypeId",
      required: true,
      value: "",
    },
    timestamp: {
      label: "Time",
      error: null,
      name: "timestamp",
      required: true,
      value: "",
    },
    severity: {
      label: "Severity",
      error: null,
      name: "severity",
      required: true,
      value: "",
    },
  });

  const createFormEntry = (file: File) => ({
    file,
    data: {
      title: {
        label: "Title",
        error: null,
        name: "title",
        required: true,
        value: "",
      },
      description: {
        label: "Description",
        error: null,
        name: "description",
        required: true,
        value: "",
      },
      videoId: {
        label: "Link video",
        error: null,
        name: "videoId",
        required: true,
        value: "",
      },
      imageMetaData: [createImageMeta()],
    },
  });

  const getImageDefectTypes = async () => {
    const response = await assetService.getImageDefectTypes();
    if (response.status === 200) {
      response.data.defects.length > 0
        ? setDefectFieldData(response.data.defects)
        : [];
      response.data.directions.length > 0
        ? setDirections(response.data.directions)
        : [];
    }
  };

  const getVideos = async () => {
    let insId = inspectionId;
    if (!viewFlow) {
      const id = getLocalStorage("IID");
      if (id) {
        insId = id;
      }
    }
    const response = await assetService.getVideosMetaData(insId);
    setVideos(response.data);
  };

  const removeDefectField = (imageIndex: number, index: number) => {
    setForm((prev) =>
      prev.map((item, i) =>
        i === imageIndex
          ? {
              ...item,
              data: {
                ...item.data,
                imageMetaData: item.data.imageMetaData.filter(
                  (_, idx) => idx !== index
                ),
              },
            }
          : item
      )
    );
    setSelectedUnit((prev) =>
      prev
        .map((item) =>
          item.image === imageIndex
            ? {
                ...item,
                meta: item.meta.filter((meta) => meta.index !== index),
              }
            : item
        )
        .filter((item) => item.meta.length > 0)
    );
  };

  const removeFile = (imageIndex: number) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== imageIndex)
    );
    setSelectedImage((prevSelected) => {
      if (prevSelected >= imageIndex) {
        return Math.max(0, prevSelected - 1);
      }
      return prevSelected;
    });
    setForm((prevForm) => prevForm.filter((_, index) => index !== imageIndex));
    setToggleForm((prevToggle) =>
      prevToggle.filter((_, index) => index !== imageIndex)
    );
  };

  const addMoreDefect = (imageIndex: number) => {
    setForm((prev) =>
      prev.map((item, index) => {
        if (index === imageIndex) {
          const newMeta = createImageMeta();

          newMeta.direction.value = directions[0] || "";
          newMeta.defectTypeId.value = defectTypes[0] || "";
          newMeta.severity.value = getSeverity(defectTypes[0]) || "";

          return {
            ...item,
            data: {
              ...item.data,
              imageMetaData: [...item.data.imageMetaData, newMeta],
            },
          };
        }
        return item;
      })
    );
  };

  const validateInput = (
    formData: ObservationFormImageData,
    key: string,
    value: string,
    defectIndex?: number
  ): string | null => {
    const currentField =
      defectIndex !== undefined
        ? formData.imageMetaData[defectIndex][key as keyof ImageFormMetaData]
        : formData[key as keyof ObservationFormImageData];
    if (
      currentField &&
      typeof currentField === "object" &&
      "required" in currentField
    ) {
      let error = null;
      if (key === "distance" && value.trim() !== "") {
        error = isNumber(value) ? null : "Invalid distance.";
        return error;
      }
      if (key === "timestamp" && value.trim() !== "") {
        error = isValidTimeStamp(value) ? null : "Format (hh:mm:ss)";
        return error;
      }
      return currentField?.required && value.trim() === ""
        ? "This field is required"
        : null;
    }
    return null;
  };

  const handleInput = (
    key: string,
    value: string,
    imageIndex: number,
    index?: number
  ) => {
    setForm((prev) => {
      const error = validateInput(prev[imageIndex].data, key, value, index);
      return updateFormState(prev, imageIndex, key, value, error, index);
    });
  };

  const updateFormState = (
    prev: { file: File | null; data: ObservationFormImageData }[],
    imageIndex: number,
    key: string,
    value: string,
    error: string | null,
    defectIndex?: number
  ) => {
    const updatedForm = [...prev];
    if (!updatedForm[imageIndex]) return prev;

    const updatedEntry = { ...updatedForm[imageIndex] };

    const updatedData: ObservationFormImageData = { ...updatedEntry.data };

    const updateField = (field: Field<string>): Field<string> => ({
      ...field,
      value,
      error,
    });

    if (defectIndex !== undefined) {
      const updatedMeta = [...updatedData.imageMetaData];
      if (updatedMeta[defectIndex]) {
        updatedMeta[defectIndex] = {
          ...updatedMeta[defectIndex],
          [key]: {
            ...updatedMeta[defectIndex][key as keyof ImageFormMetaData],
            value,
            error,
          },
        };
      }

      if (key === "defectTypeId") {
        updatedMeta[defectIndex].severity = {
          ...updatedMeta[defectIndex].severity,
          value: getSeverity(value) || "",
        };
      }

      updatedData.imageMetaData = updatedMeta;
    } else {
      type ObservationFormDataKey = keyof ObservationFormImageData;
      if (key in updatedData && key !== "imageMetaData") {
        const dataKey = key as ObservationFormDataKey;
        if (
          typeof updatedData[dataKey] === "object" &&
          "value" in (updatedData[dataKey] as any)
        ) {
          (updatedData[dataKey] as Field<string>) = updateField(
            updatedData[dataKey] as Field<string>
          );
        }
      }
    }

    updatedForm[imageIndex] = {
      ...updatedEntry,
      data: updatedData,
    };

    return updatedForm;
  };

  const handleUnitChange = (
    imageIndex: number,
    metaIndex: number,
    unit: string
  ) => {
    setSelectedUnit((prev) => {
      const updatedUnits = prev.map((item) =>
        item.image === imageIndex
          ? {
              ...item,
              meta: item.meta.some((meta) => meta.index === metaIndex)
                ? item.meta.map((meta) =>
                    meta.index === metaIndex ? { ...meta, unit } : meta
                  )
                : [...item.meta, { unit, index: metaIndex }],
            }
          : item
      );

      return updatedUnits.some((item) => item.image === imageIndex)
        ? updatedUnits
        : [
            ...updatedUnits,
            { image: imageIndex, meta: [{ unit, index: metaIndex }] },
          ];
    });
  };

  const updateTabToggle = (image: number, newActive: number) => {
    setToggleForm((prev) =>
      prev.map((item) =>
        item.image === image
          ? { ...item, form: { ...item.form, active: newActive } }
          : item
      )
    );
  };

  const handleSubmit = async () => {
    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "next", values: { disabled: true, loading: true } },
        { key: "submit", values: { disabled: true, loading: true } },
      ])
    );
    if (isAllDataValid()) {
      const extractedData = extractInspectionObservationImageData(
        form,
        selectedUnit,
        defectFieldData,
        videos,
        toggleForm
      );
      let count = 0;
      if (extractedData.length > 0) {
        let inspecId = inspectionId;
        if (!viewFlow) {
          const id = getLocalStorage("IID");
          if (id) inspecId = id;
        }
        for (const form of extractedData) {
          const { file, ...otherProps } = form;
          const response = await assetService.uploadFile(
            inspecId,
            "image",
            file,
            otherProps,
            updateProgress
          );
          if (response.status === 200) {
            count += 1;
          }
        }
      }
      if (count === form.length) {
        if (!viewFlow) {
          setLocalStorage("COMPIID", JSON.stringify([1, 2, 3]));
          updatePage(4, false);
        }
        if (viewFlow) {
          success(true);
        }
      }
      setButtons((prev) =>
        updateStepperButtons(prev, [
          { key: "next", values: { disabled: false, loading: false } },
          { key: "submit", values: { disabled: false, loading: false } },
        ])
      );
    }
  };

  const updateProgress = (percent: number) => {
    // Progress Status
  };

  const fileUpload = (files: File[], reset: boolean) => {
    if (reset) {
      setFiles(files);
      setSelectedImage(0);
      setForm(duplicateFormEntry(files, reset));
      setToggleForm(duplicateToggleEntry(files.length, 0));
    } else {
      setFiles((prev) => [...prev, ...files]);
      setForm((prev) => [...prev, ...duplicateFormEntry(files, reset)]);
      setToggleForm((prev) => [
        ...prev,
        ...duplicateToggleEntry(files.length, prev.length),
      ]);
    }
  };

  const duplicateToggleEntry = (length: number, imageIndex: number) => {
    return Array.from({ length }, (_, i) => createToggleInput(imageIndex + i));
  };

  const duplicateFormEntry = (files: File[], reset: boolean) => {
    return files.map((file) => createFormEntry(file));
  };

  const getSeverity = (name: string) => {
    const data = defectFieldData.find((item) => item.name === name);
    if (!data) return "";
    return data.severity;
  };

  const switchImage = (index: number) => {
    setSelectedImage(index);
  };

  const getSkipKeys = (
    toggleForm: { image: number; form: TabToggleInputData }[],
    videoNames: string[]
  ) => {
    const skipKeys: Record<number, string[]> = {};

    toggleForm.forEach((toggle) => {
      if (toggle.form.active === 2) {
        skipKeys[toggle.image] = ["direction", "defectTypeId", "severity"];
      }
    });

    if (videoNames.length === 0) {
      for (let i = 0; i < toggleForm.length; i++) {
        skipKeys[i] = [...(skipKeys[i] || []), "videoId"];
      }
    }

    return skipKeys;
  };

  const prefillSelectInput = (
    form: { file: File | null; data: ObservationFormImageData }[],
    videoNames: string[],
    directions: string[],
    defectTypes: string[]
  ) => {
    return form.map((entry, imageIndex) => {
      let updatedForm = form;

      if (videoNames.length > 0 && !entry.data.videoId?.value) {
        updatedForm = updateFormState(
          updatedForm,
          imageIndex,
          "videoId",
          videoNames[0],
          null
        );
      }

      entry.data.imageMetaData.forEach((meta, defectIndex) => {
        if (!meta.direction.value) {
          updatedForm = updateFormState(
            updatedForm,
            imageIndex,
            "direction",
            directions[0],
            null,
            defectIndex
          );
        }

        if (!meta.defectTypeId.value) {
          updatedForm = updateFormState(
            updatedForm,
            imageIndex,
            "defectTypeId",
            defectTypes[0],
            null,
            defectIndex
          );
        }

        updatedForm = updateFormState(
          updatedForm,
          imageIndex,
          "severity",
          getSeverity(meta.defectTypeId.value || defectTypes[0]) || "",
          null,
          defectIndex
        );
      });

      return updatedForm[imageIndex];
    });
  };

  const isAllDataValid = () => {
    const skipKeys = getSkipKeys(toggleForm, videoNames);
    const filled = form.every((item, index) =>
      areAllRequiredFieldsFilledForObservationImage(item, skipKeys, index)
    );
    const valid = form.every((item) =>
      areAllKeyValuesMatched(item, "error", null)
    );
    if (filled && valid) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (directions.length > 0 && defectTypes.length > 0) {
      setForm((prev) =>
        prefillSelectInput(prev, videoNames, directions, defectTypes)
      );
    }
  }, [directions, defectTypes, files]);

  useEffect(() => {
    if (
      viewData &&
      Array.isArray(viewData) &&
      viewData.every((item) => item instanceof File)
    ) {
      fileUpload(viewData, true);
    }
  }, [viewData]);

  useEffect(() => {
    if (isAllDataValid()) {
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
  }, [form, toggleForm]);

  useEffect(() => {
    setDefectTypes(defectFieldData.map((defect) => defect.name));
  }, [defectFieldData]);

  useEffect(() => {
    if (files.length === 0) {
      setPreviews([]);
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    if (selectedImage === newPreviews.length)
      switchImage(newPreviews.length - 1);
    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  useEffect(() => {
    setVideoNames(videos.map((video) => video.title));
  }, [videos]);

  useEffect(() => {
    getVideos();
    getImageDefectTypes();
  }, []);

  return (
    <div className="w-full h-full gap-4 flex flex-col">
      {files.length > 0 ? (
        <div className="w-full flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="w-full border border-platinum h-fit md:h-150 flex justify-center p-2 rounded-lg">
              {previews.length > 0 && selectedImage <= previews.length ? (
                <div className="flex w-full h-full flex-col gap-2">
                  <div className="h-[50%] w-full">
                    <Image
                      src={previews[selectedImage]}
                      width={850}
                      height={495}
                      className="w-full h-full object-contain rounded-lg"
                      alt="Preview Image"
                    />
                  </div>
                  <div className="flex flex-col gap-2 h-full  md:justify-between">
                    <Input
                      props={form[selectedImage].data.title}
                      onChange={(key, value) =>
                        handleInput(key, value, selectedImage)
                      }
                    />
                    <div className="h-fit">
                      <TextAreaInput
                        props={form[selectedImage].data.description}
                        onChange={(key, value) =>
                          handleInput(key, value, selectedImage)
                        }
                      />
                    </div>
                    <div className="w-full flex gap-4 items-end">
                      {videoNames.length > 0 && (
                        <div className="w-1/2">
                          <SelectInput
                            props={{
                              ...form[selectedImage].data.videoId,
                              options: videoNames,
                              editInput: false,
                            }}
                            onChange={(key, value) =>
                              handleInput(key, value, selectedImage)
                            }
                          />
                        </div>
                      )}
                      <div className="w-1/2">
                        <TabToggleInput
                          data={toggleForm[selectedImage].form}
                          onChange={(id) => updateTabToggle(selectedImage, id)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-sm text-liver font-normal text-center">
                  Click to preview images and enter observations
                </span>
              )}
            </div>
            <div className="w-full md:min-w-60 md:w-60 border md:h-150 overflow-y-auto custom-scrollbar flex flex-col gap-2 border-platinum p-2 rounded-lg">
              <div className="w-full h-fit">
                <FileUpload
                  size="medium"
                  onChange={(files) => fileUpload(files, false)}
                  data={fileType}
                />
              </div>
              {previews.length > 0 && (
                <div className="w-full flex flex-col gap-4 scrollbar-none">
                  {previews.map((url, index) => (
                    <div
                      className={`w-full rounded-lg md:h-32 overflow-hidden border ${
                        selectedImage === index && "border-primary"
                      } relative cursor-pointer`}
                      key={index}
                      onClick={() => switchImage(index)}
                    >
                      <Image
                        src={url}
                        width={100}
                        height={100}
                        className="w-full h-full rounded-lg object-fill"
                        alt="Preview Image"
                      />
                      <Image
                        src="/images/delete-icon.svg"
                        onClick={(e) => {
                          e.stopPropagation(), removeFile(index);
                        }}
                        className="absolute top-2 right-2 cursor-pointer"
                        width={24}
                        height={24}
                        alt="Delete Image"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="border flex w-full flex-col border-platinum rounded-lg p-2 gap-4">
            {form[selectedImage].data.imageMetaData.map((_, index) => (
              <div key={index}>
                <div
                  className={`flex flex-col md:flex-row w-full gap-4`}
                  key={index}
                >
                  <InputWithSelect
                    props={{
                      ...form[selectedImage].data.imageMetaData[index].distance,
                      options: units,
                      unitValue:
                        selectedUnit.find(
                          (item) => item.image === selectedImage
                        )?.meta[index]?.unit || "",
                    }}
                    hideLabel={window.innerWidth < 768 ? false : index !== 0}
                    onChange={(key, value) =>
                      handleInput(key, value, selectedImage, index)
                    }
                    onUnitChange={(_, unit) =>
                      handleUnitChange(selectedImage, index, unit)
                    }
                  />
                  <div className="md:w-150">
                    <Input
                      props={
                        form[selectedImage].data.imageMetaData[index].timestamp
                      }
                      hideLabel={window.innerWidth < 768 ? false : index !== 0}
                      onChange={(key, value) =>
                        handleInput(key, value, selectedImage, index)
                      }
                    />
                  </div>
                  <SelectInput
                    props={{
                      ...form[selectedImage].data.imageMetaData[index]
                        .direction,
                      options: directions,
                      editInput: false,
                    }}
                    hideLabel={window.innerWidth < 768 ? false : index !== 0}
                    onChange={(key, value) =>
                      handleInput(key, value, selectedImage, index)
                    }
                  />
                  {toggleForm[selectedImage].form.active === 2 ? (
                    <></>
                  ) : (
                    <>
                      <SelectInput
                        props={{
                          ...form[selectedImage].data.imageMetaData[index]
                            .defectTypeId,
                          options: defectTypes,
                          editInput: false,
                        }}
                        hideLabel={
                          window.innerWidth < 768 ? false : index !== 0
                        }
                        onChange={(key, value) =>
                          handleInput(key, value, selectedImage, index)
                        }
                      />
                      <div className="min-w-16">
                        <Input
                          props={{
                            ...form[selectedImage].data.imageMetaData[index]
                              .severity,
                            readonly: true,
                            disabled: true,
                          }}
                          hideLabel={
                            window.innerWidth < 768 ? false : index !== 0
                          }
                        />
                      </div>
                    </>
                  )}
                  {form[selectedImage].data.imageMetaData.length !== 1 && (
                    <div className="cursor-pointer min-w-8 flex justify-end md:justify-center items-center">
                      {index !== 0 && (
                        <Image
                          src="/images/delete-icon.svg"
                          width={24}
                          height={24}
                          onClick={() =>
                            removeDefectField(selectedImage, index)
                          }
                          alt="Delete Defect"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className="w-full flex justify-end items-center">
              {buttons.more && (
                <StepperButton
                  data={buttons.more}
                  onClick={() => addMoreDefect(selectedImage)}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <FileUpload
          onChange={(files) => fileUpload(files, true)}
          data={fileType}
          size="large"
        />
      )}

      <div className="w-full flex justify-end items-center gap-4">
        {buttons.back && !viewFlow && (
          <StepperButton data={buttons.back} onClick={() => {}} />
        )}
        {buttons.skip && form.length === 0 && !viewFlow && (
          <StepperButton
            data={buttons.skip}
            onClick={() => updatePage(4, true)}
          />
        )}
        {buttons.next && form.length !== 0 && !viewFlow && (
          <StepperButton data={buttons.next} onClick={handleSubmit} />
        )}
        {buttons.cancel && viewFlow && (
          <StepperButton data={buttons.cancel} onClick={cancel} />
        )}
        {buttons.submit && form.length !== 0 && viewFlow && (
          <StepperButton data={buttons.submit} onClick={handleSubmit} />
        )}
      </div>
    </div>
  );
};

export default UploadImage;
