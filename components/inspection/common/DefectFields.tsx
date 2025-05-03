import { ImageFormMetaData } from "@/types/inpection";
import {
  InputWithSelect,
  Input,
  SelectInput,
} from "@/components/common/Inputs";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

interface DefectFieldsProps {
  index: number;
  handleInput: (key: string, value: string) => void;
  handleUnitChange: (key: string, value: string) => void;
  form: ImageFormMetaData;
  units: string[];
  defects: string[];
  directions: string[];
  image: string;
  canEdit: boolean;
  onClick?: (value: string) => void;
  hideLabel?: boolean;
}

const DefectFields: React.FC<DefectFieldsProps> = ({
  handleInput,
  index,
  form,
  units,
  defects,
  directions,
  image,
  canEdit,
  onClick = (value: string) => {},
  hideLabel,
}) => {
  const { setPopupType, setShowPopup, setImageUrl } = useAppContext();
  return (
    <div className="w-full h-full flex gap-4 flex-wrap md:flex-nowrap">
      <div className="w-full">
        <InputWithSelect
          props={{
            ...form.distance,
            options: units,
            readonly: !canEdit,
            value: form.distance.value,
          }}
          hideLabel={hideLabel}
        />
      </div>
      <div className="w-150 relative">
        <Input
          props={{
            ...form.timestamp,
            readonly: !canEdit,
            value: form.timestamp.value,
          }}
          hideLabel={hideLabel}
        />
        <Image
          src="/images/popup.svg"
          className={`absolute top-1/2 right-2 cursor-pointer ${
            hideLabel && "-translate-y-1/2"
          }`}
          width={24}
          height={24}
          alt="Seek"
          onClick={() => onClick(form.timestamp.value ?? "")}
        />
      </div>
      <div className="w-full">
        <SelectInput
          props={{
            ...form.direction,
            readonly: !canEdit,
            editInput: false,
            options: directions,
            value: form.direction.value,
          }}
          hideLabel={hideLabel}
        />
      </div>
      {form.defectTypeId.value !== "" && (
        <div className="w-full">
          <SelectInput
            props={{
              ...form.defectTypeId,
              options: defects,
              editInput: false,
              readonly: !canEdit,
              value: form.defectTypeId.value,
            }}
            hideLabel={hideLabel}
          />
        </div>
      )}
      {form.severity.value !== "" && (
        <div className="w-16 min-w-16">
          <Input
            props={{
              ...form.severity,
              readonly: true,
              disabled: true,
              value: form.severity.value,
            }}
            hideLabel={hideLabel}
          />
        </div>
      )}
      <div className="flex flex-col gap-1 min-w-16 w-16">
        <label
          className={`text-trollyGray text-sm gap-1 ${
            hideLabel ? "hidden" : "flex"
          }`}
        >
          Preview
        </label>
        <div
          className="h-full flex items-center justify-center cursor-pointer"
          onClick={() => {
            setImageUrl(image);
            setPopupType("image");
            setShowPopup(true);
          }}
        >
          <Image src="/images/image.svg" width={24} height={24} alt="Preview" />
        </div>
      </div>
    </div>
  );
};

export default DefectFields;
