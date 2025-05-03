import { InSightsData, InspectionPageProps } from "@/types/inpection";
import { Input, SelectInput, TextAreaInput } from "@/components/common/Inputs";
import { useEffect, useState } from "react";
import { InSightsFormData, Risk, InSightFieldOption } from "@/types/inpection";
import { StepperButtons } from "@/types/button";
import { StepperButton } from "@/components/common/Buttons";
import Image from "next/image";
import { inspectionService } from "@/services/inspectionService";
import {
  areAllKeyValuesMatched,
  areAllRequiredFieldsFilled,
  extractInspectionInsightsData,
  updateStepperButtons,
  checkAllVideosCompleted,
  processInspectionDataKeyandValue,
} from "@/helpers/helper";
import axios from "axios";
import DropDown from "@/components/common/DropDown";
import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "@/utils/utils";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import Constants from "@/constants/constants";

const createNewRecommendation = () => ({
  recommendation: {
    label: "Recommendation",
    name: "recommendation",
    error: null,
    required: false,
    value: "",
  },
});

const InSights: React.FC<InspectionPageProps> = ({
  createFlow,
  data,
  success = () => {},
  updatePage = () => {},
}) => {
  const [buttons, setButtons] = useState<StepperButtons>({
    back: { loading: false, disabled: false, label: "Back", name: "back" },
    skip: { loading: false, disabled: false, label: "Skip", name: "skip" },
    more: { disabled: false, label: "Add more", name: "more", loading: false },
    submit: {
      loading: false,
      disabled: true,
      label: "Submit",
      name: "submit",
    },
  });
  const { storedQueue, setStoredQueue, inspectionId } = useAppContext();
  const [form, setForm] = useState<InSightsFormData>({
    rating: {
      label: "Rating",
      name: "rating",
      error: null,
      required: true,
      value: "",
    },
    category: {
      label: "Category",
      name: "category",
      error: null,
      required: true,
      value: "",
    },
    description: {
      label: "Description",
      name: "description",
      error: null,
      required: true,
      value: "",
    },
    recommendations: [createNewRecommendation()],
  });
  const router = useRouter();
  const [fieldOptions, setFieldOptions] = useState<InSightFieldOption>();
  const [risk, setRisk] = useState<Risk>({
    rating: [],
    category: [],
  });
  const [aiRecommendation, setAiRecommendation] = useState<string>("");
  const [showRecom, setShowRecom] = useState<number>();
  const [generating, setGenerating] = useState<number>();
  const [showSkip, setShowSkip] = useState<boolean>(true);

  const handleInput = (key: string, value: string, index?: number) => {
    setForm((prev) => {
      if (index !== undefined) {
        let error: string | null = null;
        prev.recommendations.map((rec, i) => {
          if ("required" in rec.recommendation && rec.recommendation.required) {
            error = value.trim() === "" ? "This field is required." : null;
          }
        });

        return updateInsightsState(prev, key, value, error, index);
      } else {
        const field = prev[key as keyof InSightsFormData];
        let error = null;
        if ("required" in field && field.required) {
          error = value.trim() === "" ? "This field is rquired." : null;
        }

        return updateInsightsState(prev, key, value, error);
      }
    });
  };

  const updateInsightsState = (
    prev: InSightsFormData,
    key: string,
    value: string,
    error: string | null,
    index?: number
  ) => {
    if (index !== undefined) {
      return {
        ...prev,
        recommendations: prev.recommendations.map((rec, i) =>
          i === index
            ? {
                recommendation: {
                  ...rec.recommendation,
                  value,
                  error,
                },
              }
            : rec
        ),
      };
    } else {
      const field = prev[key as keyof InSightsFormData];
      return {
        ...prev,
        [key]: {
          ...field,
          value,
          error,
        },
      };
    }
  };

  const addMoreRecommendation = () => {
    setForm((prev) => ({
      ...prev,
      recommendations: [...prev.recommendations, createNewRecommendation()],
    }));
  };

  const removeRecommendation = (index: number) => {
    setForm((prev) => ({
      ...prev,
      recommendations: prev.recommendations.filter((_, id) => id !== index),
    }));
  };

  const handleSubmit = async () => {
    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "submit", values: { disabled: true, loading: true } },
      ])
    );
    if (
      areAllKeyValuesMatched(form, "error", null) &&
      areAllRequiredFieldsFilled(form)
    ) {
      const inspectId = createFlow
        ? getLocalStorage(Constants.INSPECTION_ID)
        : inspectionId;
      if (inspectId) {
        const extractedData = extractInspectionInsightsData(form);
        const response = await inspectionService.updateInspection(
          inspectId,
          extractedData
        );
        if (response.status === 200) {
          if (!createFlow) {
            success();
          } else {
            completeInspectionForm();
          }
        }
      }
    }
    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "submit", values: { loading: false } },
      ])
    );
  };

  const completeInspectionForm = () => {
    if (checkAllVideosCompleted(storedQueue)) {
      setStoredQueue([]);
      removeLocalStorage("progress");
    }
    removeLocalStorage("IID");
    removeLocalStorage("COMPIID");
    router.push("/inspections");
  };

  const getFieldTypes = async () => {
    const response = await inspectionService.getFieldOptions();
    if (response.status === 200) {
      const data = response.data.inspection_type_fields.insights;
      setFieldOptions(data);
      setRisk({
        rating: data.risk.rating,
        category: Object.keys(data.risk.categories),
      });
    }
  };

  const getCategory = (rating: string): string => {
    const category = fieldOptions?.risk.categories;
    return (
      Object.keys(category ?? {}).find((key) =>
        category?.[key].includes(rating)
      ) ?? ""
    );
  };

  const getAIRecommendation = async (index: number) => {
    setGenerating(index);
    const response = await axios.post(
      "/api/rephrase",
      form.recommendations[index].recommendation.value
    );
    if (response.status === 200) {
      setAiRecommendation(response.data.data);
      setShowRecom(index);
    }
    setGenerating(undefined);
  };

  const handleBack = () => {
    setLocalStorage("COMPIID", JSON.stringify([1, 2]));
    updatePage(3, false);
  };

  const getInspection = async () => {
    const inspectionId = getLocalStorage(Constants.INSPECTION_ID);
    if (inspectionId) {
      const response = await inspectionService.getInspectionById(inspectionId);
      if (response.status === 200 && response.data?.insightsData) {
        processInsightsToShow(response.data.insightsData);
      }
    }
  };

  const processInsightsToShow = (insights: InSightsData) => {
    processInspectionDataKeyandValue(insights, (key, value) => {
      if (key === "recommendations") {
        if (Array.isArray(value)) {
          setForm((prev) => ({
            ...prev,
            recommendations: value.map((rec) => ({
              recommendation: {
                value: rec.description || "",
                error: null,
                label: "Recommendation",
                name: "recommendation",
                required: false,
              },
            })),
          }));
        }
      } else {
        setForm((prev) => updateInsightsState(prev, key, value, null));
      }
    });
  };

  useEffect(() => {
    if (
      form.description.value !== "" ||
      form.recommendations.length > 1 ||
      (form.recommendations.length > 0 &&
        form.recommendations[0].recommendation.value !== "")
    ) {
      setShowSkip(false);
    } else {
      setShowSkip(true);
    }
  }, [form.description, form.recommendations]);

  useEffect(() => {
    if (
      areAllKeyValuesMatched(form, "error", null) &&
      areAllRequiredFieldsFilled(form)
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
    setForm((prev) =>
      updateInsightsState(
        prev,
        "category",
        getCategory(form.rating.value ?? ""),
        null
      )
    );
  }, [form.rating]);

  useEffect(() => {
    if (!createFlow && data) {
      processInsightsToShow(data as InSightsData);
    }
  }, [createFlow, data]);

  useEffect(() => {
    getInspection();
  }, []);

  useEffect(() => {
    getFieldTypes();
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex flex-col gap-4  p-4 w-full rounded-2xl border border-platinum">
        <h5 className="text-liver text-sm font-medium">Pipeline Information</h5>
        <div
          className={`w-full flex flex-col ${
            createFlow && "md:flex-row"
          } gap-4`}
        >
          <div className={`w-full  ${createFlow && "md:w-[10%]"}`}>
            <SelectInput
              props={{
                ...form.rating,
                options: risk.rating,
                editInput: false,
              }}
              onChange={handleInput}
            />
          </div>
          <div className={`w-full ${createFlow && "md:w-[20%]"}`}>
            <Input props={{ ...form.category, disabled: true }} />
          </div>
          <div className={`w-full ${createFlow && " md:w-[70%]"}`}>
            <Input props={form.description} onChange={handleInput} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4  p-4 w-full border border-platinum rounded-2xl">
        <h5 className="text-liver text-sm font-medium">Recommendations</h5>
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col w-full gap-4">
            {form.recommendations.length > 0 &&
              form.recommendations.map((item, index) => (
                <div className="w-full flex items-center gap-4" key={index}>
                  <span className="text-sm text-liver font-medium">
                    {index + 1}
                  </span>
                  <div className="w-full relative">
                    <TextAreaInput
                      props={item.recommendation}
                      hideLabel={true}
                      padding="py-3 pl-2 pr-20"
                      onChange={(key, value) => handleInput(key, value, index)}
                    />
                    {item.recommendation.value && (
                      <>
                        <div
                          className="text-primary text-[13px] cursor-pointer flex gap-2 items-center justify-center font-medium absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => getAIRecommendation(index)}
                        >
                          <span>Generate</span>
                          {generating === index && (
                            <Image
                              src="/images/loading-black.svg"
                              width={14}
                              height={14}
                              alt="Loading.."
                              className="animate-spin"
                            />
                          )}
                        </div>
                        <DropDown
                          onChange={(value) => {
                            handleInput("recommendation", value, index);
                            setAiRecommendation("");
                            setShowRecom(undefined);
                          }}
                          options={[aiRecommendation]}
                          setShow={() => {}}
                          show={showRecom === index}
                          right={0}
                          full={true}
                        />
                      </>
                    )}
                  </div>

                  <Image
                    src="/images/delete-icon.svg"
                    className="cursor-pointer"
                    width={24}
                    height={24}
                    onClick={() => removeRecommendation(index)}
                    alt="Delete Recommendation"
                  />
                </div>
              ))}
          </div>

          <div className="w-full flex justify-end items-center">
            {buttons.more && (
              <StepperButton
                data={buttons.more}
                onClick={addMoreRecommendation}
              />
            )}
          </div>
        </div>
      </div>
      {createFlow && (
        <div className="flex justify-end gap-4 flex-wrap">
          {buttons.back && (
            <StepperButton data={buttons.back} onClick={handleBack} />
          )}
          {!showSkip && buttons.submit && (
            <StepperButton data={buttons.submit} onClick={handleSubmit} />
          )}
          {showSkip && buttons.skip && (
            <StepperButton
              data={buttons.skip}
              onClick={completeInspectionForm}
            />
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

export default InSights;
