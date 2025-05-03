import { ImageCardProps } from "@/types/inpection";
import Image from "next/image";
import { useState } from "react";
import { IconBox } from "@/components/common/IconBox";
import { Actions } from "@/types/common";
import { useAppContext } from "@/context/AppContext";

const LegacyImageCard: React.FC<ImageCardProps> = ({ data, onClick, actions }) => {
  const [defectIndex, setDefectIndex] = useState<number>(0);
  const { allowedActions } = useAppContext();

  const isLoading = (imgId: string, action: Actions): boolean => {
    return actions.some(
      (item) => item.id === imgId && item.action === action && item.loading
    );
  };

  const handleNavigation = (isNext: boolean) => {
    isNext
      ? setDefectIndex((prev) => prev + 1)
      : setDefectIndex((prev) => prev - 1);
  };

  return (
    <div className="border border-platinum rounded-2xl p-2 gap-2 flex flex-col bg-snow hover:shadow-sm h-full w-full group">
      <div className="rounded-lg relative cursor-pointer">
        <Image
          src={data.imageUrl}
          width={300}
          height={160}
          className="rounded-lg w-full h-[160px]"
          alt="Image"
          unoptimized
        />
        <Image
          src="/images/checkbox.svg"
          width={24}
          height={24}
          alt="Select"
          className="absolute hidden cursor-pointer top-1 left-1"
        />
        {allowedActions.download && (
          <IconBox
            action="download"
            icon="download.svg"
            className="absolute hidden group-hover:block top-2 right-2"
            onClick={(action) => onClick(action, data.imgId)}
            loading={isLoading(data.imgId, "download")}
          />
        )}
        {allowedActions.edit && (
          <IconBox
            action="edit"
            icon="edit.svg"
            className="absolute hidden group-hover:block bottom-2 right-12"
            onClick={(action) => onClick(action, data.imgId)}
          />
        )}
        {allowedActions.delete && (
          <IconBox
            action="delete"
            loading={isLoading(data.imgId, "delete")}
            icon="delete-icon.svg"
            className="absolute hidden group-hover:block bottom-2 right-2"
            onClick={(action) => onClick(action, data.imgId)}
          />
        )}
      </div>
      <div className="flex flex-col gap-4 w-full px-1">
        <div className="w-full flex gap-2 flex-col">
          <h5 className="text-base text-smokyBlack font-medium">
            {data.title}
          </h5>
          <p
            className="text-xs text-liver font-normal truncate"
            title=" In this direction the pipeline appears clean and clear"
          >
            {data.description}
          </p>
        </div>
        {data.defects.length > 0 && (
          <div
            className={`flex gap-2 justify-between flex-wrap relative  ${
              defectIndex !== 0 && "pl-4"
            } ${defectIndex !== data.defects.length - 1 && "pr-4"}`}
          >
            <div className="flex gap-1 flex-col">
              <h5 className="text-sm text-liver font-normal">Distance</h5>
              <p className="text-sm text-smokyBlack font-medium">
                {data.defects[defectIndex].distance}
              </p>
            </div>
            {data.defects[defectIndex].defect && (
              <>
                <div className="flex gap-1 flex-col">
                  <h5 className="text-sm text-liver font-normal">
                    Defect Code
                  </h5>
                  <p className="text-sm text-smokyBlack font-medium">
                    {data.defects[defectIndex].defect.code}
                  </p>
                </div>
                <div className="flex gap-1 flex-col">
                  <h5 className="text-sm text-liver font-normal">Severity</h5>
                  <p className="text-sm text-smokyBlack font-medium">
                    {data.defects[defectIndex].defect.severity}
                  </p>
                </div>
              </>
            )}
            {data.defects.length > 1 && (
              <>
                {defectIndex !== 0 && (
                  <Image
                    src="/images/chevron-down-icon.svg"
                    className="rotate-90 absolute top-1/2 -translate-y-1/2 -left-3 cursor-pointer"
                    width={24}
                    height={24}
                    alt="Left"
                    onClick={() => handleNavigation(false)}
                  />
                )}

                {defectIndex !== data.defects.length - 1 && (
                  <Image
                    src="/images/chevron-down-icon.svg"
                    className="-rotate-90 absolute top-1/2 -translate-y-1/2 -right-3 cursor-pointer"
                    width={24}
                    height={24}
                    alt="Right"
                    onClick={() => handleNavigation(true)}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LegacyImageCard;
