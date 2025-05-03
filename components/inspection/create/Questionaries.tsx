import { useEffect, useState } from "react";
import { SelectInput, Input, InputWithSelect } from "../../common/Inputs";
import {
  QuestionariesFormData,
  FieldOptionsData,
  InspectionPageProps,
} from "@/types/inpection";
import { inspectionService } from "@/services/inspectionService";
import { StepperButtons } from "@/types/button";
import { isNumber, getLocalStorage, setLocalStorage } from "@/utils/utils";
import {
  areAllRequiredFieldsFilled,
  areAllKeyValuesMatched,
  extractInspectionQuestionariesData,
  processInspectionDataKeyandValue,
} from "@/helpers/helper";
import { StepperButton } from "../../common/Buttons";
import { updateStepperButtons } from "@/helpers/helper";
import { useAppContext } from "@/context/AppContext";
import Constants from "@/constants/constants";

const Questionaries: React.FC<InspectionPageProps> = ({
  createFlow,
  data,
  updatePage = () => {},
  success = () => {},
}) => {
  const [questionaries, setQuestionaries] = useState<QuestionariesFormData>({
    pipelineType: {
      label: "Pipeline type",
      name: "pipelineType",
      required: true,
      error: null,
      value: "",
    },
    material: {
      label: "Material",
      name: "material",
      required: true,
      error: null,
      value: "",
    },
    diameter: {
      label: "Diameter",
      name: "diameter",
      required: true,
      error: null,
      value: "",
    },
    length: {
      label: "Length",
      name: "length",
      required: true,
      error: null,
      value: "",
    },
    soilType: {
      label: "Soil type",
      name: "soilType",
      required: false,
      error: null,
      value: "",
    },
    flowRate: {
      label: "Flow rate",
      name: "flowRate",
      required: true,
      error: null,
      value: "",
    },
    age: {
      label: "Age(years)",
      name: "age",
      required: true,
      error: null,
      value: "",
    },
    direction: {
      label: "Direction",
      name: "direction",
      required: true,
      error: null,
      value: "",
    },
    pipelineIssue: {
      label: "Pipeline issue",
      name: "pipelineIssue",
      required: true,
      error: null,
      value: "",
    },
    maintenance: {
      frequency: {
        label: "Frequency",
        name: "frequency",
        required: false,
        error: null,
        value: "",
      },
      times: {
        label: "Times",
        name: "times",
        required: true,
        error: null,
        value: "",
      },
    },
  });
  const [buttons, setButtons] = useState<StepperButtons>({
    back: { loading: false, disabled: false, label: "Back", name: "back" },
    next: { loading: false, disabled: true, label: "Next", name: "next" },
    submit: {
      loading: false,
      disabled: true,
      label: "Submit",
      name: "submit",
    },
  });
  const [fieldOptions, setFieldOptions] = useState<FieldOptionsData>();
  const [pipelineTypes, setPipelineTypes] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>(["M"]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [diameters, setDiameters] = useState<string[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const { inspectionId } = useAppContext();

  const getFieldOptions = async () => {
    const response = await inspectionService.getFieldOptions();
    if (response.status === 200) {
      setFieldOptions(response.data.inspection_type_fields);
    }
  };

  const handleInput = (key: string, value: string) => {
    setQuestionaries((prev) => {
      let error = null;
      if (
        (key in prev.maintenance &&
          prev.maintenance[key as keyof typeof prev.maintenance]?.required) ||
        (key in prev &&
          prev[key as keyof QuestionariesFormData] &&
          typeof prev[key as keyof QuestionariesFormData] === "object" &&
          "required" in prev[key as keyof QuestionariesFormData] &&
          (prev[key as keyof QuestionariesFormData] as any).required === true)
      ) {
        error = value.trim() === "" ? "This field is required." : null;
      }
      return updateQuestionariesState(prev, key, value, error);
    });
    if (key === "diameter") {
      setQuestionaries((prev) =>
        updateQuestionariesState(
          prev,
          key,
          value,
          value.endsWith("mm") && isNumber(value.split("mm")[0])
            ? null
            : "Invalid diameter."
        )
      );
    }
    if (key === "length" || key === "age" || key === "times") {
      setQuestionaries((prev) =>
        updateQuestionariesState(
          prev,
          key,
          value,
          isNumber(value) ? null : "Kindly enter a valid number."
        )
      );
    }
  };

  const updateQuestionariesState = (
    prev: QuestionariesFormData,
    key: string,
    value: string,
    error: string | null
  ) => {
    return {
      ...prev,
      ...(key in prev.maintenance
        ? {
            maintenance: {
              ...prev.maintenance,
              [key]: {
                ...prev.maintenance[key as keyof typeof prev.maintenance],
                value,
                error,
              },
            },
          }
        : {
            [key]: {
              ...prev[key as keyof QuestionariesFormData],
              value,
              error,
            },
          }),
    };
  };

  const handleSubmit = async () => {
    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "next", values: { disabled: true, loading: true } },
        { key: "submit", values: { disabled: true, loading: true } },
      ])
    );
    const data = extractInspectionQuestionariesData(
      questionaries,
      selectedUnit
    );
    const inspectId = createFlow
      ? getLocalStorage(Constants.INSPECTION_ID)
      : inspectionId;
    if (inspectId) {
      const response = await inspectionService.updateInspection(
        inspectId,
        data
      );
      if (response.status === 200) {
        if (!createFlow) {
          success();
        } else {
          setLocalStorage("COMPIID", JSON.stringify([1, 2]));
          updatePage(3, false);
        }
      }
    }
    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "next", values: { disabled: false, loading: false } },
        { key: "submit", values: { loading: false } },
      ])
    );
  };

  const handleBack = () => {
    setLocalStorage("COMPIID", JSON.stringify([]));
    updatePage(1, false);
  };

  const getInspection = async () => {
    const inspectionId = getLocalStorage(Constants.INSPECTION_ID);
    if (inspectionId) {
      const response = await inspectionService.getInspectionById(inspectionId);
      if (response.status === 200 && response.data?.questionariesData) {
        processInspectionDataKeyandValue(
          response.data.questionariesData,
          (key, value) =>
            setQuestionaries((prev) =>
              updateQuestionariesState(prev, key, value, null)
            )
        );
      }
    }
  };

  useEffect(() => {
    if (
      areAllRequiredFieldsFilled(questionaries) &&
      areAllKeyValuesMatched(questionaries, "error", null)
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
  }, [questionaries]);

  useEffect(() => {
    const pipelineType = questionaries.pipelineType.value;
    const filteredType = fieldOptions?.pipeline_types.find(
      (type) => type.name === pipelineType
    );
    setMaterials(filteredType?.properties.materials ?? []);
    setDiameters(filteredType?.properties.diameter ?? []);
  }, [questionaries.pipelineType]);

  useEffect(() => {
    const types = fieldOptions?.pipeline_types.map((type) => type.name) ?? [];
    setPipelineTypes(types);
  }, [fieldOptions]);

  useEffect(() => {
    if (!createFlow && data) {
      processInspectionDataKeyandValue(data, (key, value) =>
        setQuestionaries((prev) =>
          updateQuestionariesState(prev, key, value, null)
        )
      );
    }
  }, [createFlow, data]);

  useEffect(() => {
    getInspection();
  }, []);

  useEffect(() => {
    getFieldOptions();
  }, []);
  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex flex-col gap-4 p-4 rounded-2xl border border-platinum">
        <h5 className="text-liver text-sm font-medium">Pipeline Information</h5>
        <div className="flex flex-col gap-6 w-full">
          <div className={`flex gap-4 w-full flex-wrap ${createFlow && 'md:flex-nowrap'}`}>
            <SelectInput
              props={{
                ...questionaries.pipelineType,
                options: pipelineTypes,
                editInput: false,
              }}
              onChange={handleInput}
            />
            <SelectInput
              props={{
                ...questionaries.material,
                options: materials,
                editInput: false,
              }}
              onChange={handleInput}
            />
          </div>
          <div className={`flex gap-4 w-full flex-wrap ${createFlow && 'md:flex-nowrap'}`}>
            <SelectInput
              props={{
                ...questionaries.diameter,
                options: diameters,
                editInput: true,
              }}
              onChange={handleInput}
            />
            <InputWithSelect
              props={{
                ...questionaries.length,
                options: units,
              }}
              onChange={handleInput}
              onUnitChange={(_, value) => setSelectedUnit(value)}
            />
          </div>
          <div className={`flex gap-4 w-full flex-wrap ${createFlow && 'md:flex-nowrap'}`}>
            <SelectInput
              props={{
                ...questionaries.soilType,
                options: fieldOptions?.soil_types ?? [],
                editInput: false,
              }}
              onChange={handleInput}
            />
            <SelectInput
              props={{
                ...questionaries.flowRate,
                options: fieldOptions?.flow_rate ?? [],
                editInput: false,
              }}
              onChange={handleInput}
            />
          </div>
          <div className={`flex gap-4 w-full flex-wrap ${createFlow && 'md:flex-nowrap'}`}>
            <Input props={questionaries.age} onChange={handleInput} />
            <SelectInput
              props={{
                ...questionaries.direction,
                options: fieldOptions?.directions ?? [],
                editInput: false,
              }}
              onChange={handleInput}
            />
          </div>
          <Input props={questionaries.pipelineIssue} onChange={handleInput} />
        </div>
      </div>
      <div className="flex flex-col gap-4 p-4 rounded-2xl border border-platinum">
        <h5 className="text-liver text-sm font-medium">Pipe maintenance</h5>
        <div className={`flex gap-4 w-full flex-wrap ${createFlow && 'md:flex-nowrap'}`}>
          <SelectInput
            props={{
              ...questionaries.maintenance.frequency,
              options: fieldOptions?.maintenance_frequency ?? [],
              editInput: false,
            }}
            onChange={handleInput}
          />
          <Input
            props={questionaries.maintenance.times}
            onChange={handleInput}
          />
        </div>
      </div>
      {createFlow && (
        <div className="flex justify-end gap-4">
          {buttons.back && (
            <StepperButton data={buttons.back} onClick={handleBack} />
          )}
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

export default Questionaries;
