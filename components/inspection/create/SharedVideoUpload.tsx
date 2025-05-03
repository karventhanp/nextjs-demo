import FileUpload from "@/components/common/FileUpload";
import { Input, TextAreaInput } from "@/components/common/Inputs";
import { ProgressBar } from "@/components/common/Progress";
import VideoPlayer from "@/components/common/VideoPlayer";
import { useAppContext } from "@/context/AppContext";
import { FileUploadData } from "@/types/common";
import { FormState } from "@/types/input";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Process } from "@/types/inpection";
import { StepperButton } from "@/components/common/Buttons";
import { StepperButtons } from "@/types/button";
import VideoQueue from "../common/VideoQueue";
import { getLocalStorage } from "@/utils/utils";
import Constants from "@/constants/constants";

interface SharedVideoUploadProps {
  form: FormState;
  video: File | null;
  process: Process;
  preview: string;
  buttons: StepperButtons;
  showProcessButton: boolean;
  privateUrl: boolean;
  onChange?: (key: string, value: string) => void;
  onFileChange?: (file: File[] | null) => void;
  cancelUpload?: () => void;
  uploadFile?: () => void;
}

const SharedVideoUpload: React.FC<SharedVideoUploadProps> = ({
  form,
  video,
  process,
  preview,
  buttons,
  showProcessButton,
  privateUrl,
  onChange = () => {},
  onFileChange = () => {},
  cancelUpload = () => {},
  uploadFile = () => {},
}) => {
  const [fileType, setFileType] = useState<FileUploadData>({
    imgUrl: "upload-video.svg",
    multiple: false,
    format: { label: "MP4, AVI, WEBM", type: ".mp4, , .avi, .webm" },
    type: "video",
  });
  const { userId } = useAppContext();

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="border flex flex-col w-full gap-4 border-platinum rounded-lg p-4">
        <div className="w-full flex gap-4">
          <div className="flex flex-col gap-4 w-1/2">
            <Input props={form.title} onChange={onChange} />
            <TextAreaInput props={form.description} onChange={onChange} />
          </div>
          <div className="w-1/2">
            {preview ? (
              <div className="w-full flex flex-col gap-2 border border-platinum rounded-lg">
                <div className="w-full h-full relative">
                  <VideoPlayer
                    url={preview}
                    control={true}
                    userId={userId}
                    privateUrl={privateUrl}
                    className="rounded-md"
                  />
                  <Image
                    src="/images/delete-icon.svg"
                    className="absolute top-2 right-2 cursor-pointer"
                    onClick={cancelUpload}
                    width={24}
                    height={24}
                    alt="Delete Video"
                  />
                </div>
                {process.active && (
                  <div className="flex flex-col gap-1 px-2 pb-2">
                    <label className="text-xs flex justify-center items-center truncate text-smokyBlack font-normal">
                      {video?.name}
                    </label>
                    <ProgressBar percent={process.percent} />
                  </div>
                )}
              </div>
            ) : (
              <FileUpload
                data={fileType}
                onChange={onFileChange}
                size="large"
              />
            )}
          </div>
        </div>
        <div className="w-full flex justify-end items-center gap-2">
          {process.active && (
            <span className="text-xs text-royalBlue font-medium">
              Do not refresh or go back during processing.
            </span>
          )}
          {buttons.process && process.percent !== 100 && showProcessButton && (
            <StepperButton data={buttons.process} onClick={uploadFile} />
          )}
        </div>
      </div>
      <div>
        <VideoQueue />
      </div>
    </div>
  );
};

export default SharedVideoUpload;
