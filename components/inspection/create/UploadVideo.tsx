import { StepperButton } from "@/components/common/Buttons";
import FileUpload from "@/components/common/FileUpload";
import { IconBox } from "@/components/common/IconBox";
import { Input, TextAreaInput } from "@/components/common/Inputs";
import { ProgressBar } from "@/components/common/Progress";
import VideoPlayer from "@/components/common/VideoPlayer";
import { useAppContext } from "@/context/AppContext";
import {
  areAllKeyValuesMatched,
  areAllRequiredFieldsFilled,
  extractFormData,
  handleBackgroundProcess,
  updateStepperButtons,
} from "@/helpers/helper";
import { assetService } from "@/services/assetService";
import { sseService } from "@/services/sseService";
import { StepperButtons } from "@/types/button";
import { FileUploadData } from "@/types/common";
import { Process, VideoQueueData } from "@/types/inpection";
import { FormState } from "@/types/input";
import { UploadProgress } from "@/types/service";
import { generateVideoThumbnail } from "@/utils/utils";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface UploadVideoProps {
  canvasView?: boolean;
  time?: number;
  success?: () => void;
}

const UploadVideo: React.FC<UploadVideoProps> = ({
  time,
  canvasView,
  success = () => {},
}) => {
  const createForm = (): FormState => ({
    title: {
      label: "Title",
      name: "title",
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
  });

  const [form, setForm] = useState<FormState>(createForm());
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | undefined>();
  const [fileType, setFileType] = useState<FileUploadData>({
    imgUrl: "upload-video.svg",
    multiple: false,
    format: { label: "MP4, AVI, WEBM", type: ".mp4, , .avi, .webm" },
    type: "video",
  });
  const [process, setProcess] = useState<Process>({
    active: false,
    percent: 0,
  });
  const [buttons, setButtons] = useState<StepperButtons>({
    process: {
      disabled: true,
      label: "Process",
      name: "process",
      loading: false,
    },
    submit: {
      disabled: false,
      label: "Submit",
      name: "submit",
      loading: false,
    },
  });
  const {
    userId,
    setShowProgressStatus,
    inspectionId,
    setStoredQueue,
    setShowOptimizedOffCanvas,
  } = useAppContext();
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleInput = (key: string, value: string) => {
    setForm((prev) => {
      let error = null;
      if (prev[key as keyof FormState].required === true) {
        error = value.trim() === "" ? "This field is required." : null;
      }
      return updateFormState(prev, key, value, error);
    });
  };

  const updateFormState = (
    prev: FormState,
    key: string,
    value: string,
    error: string | null
  ) => {
    return {
      ...prev,
      [key]: { ...prev[key], value, error },
    };
  };

  const handleFileChange = (files: File[]) => {
    setVideo(files[0]);
    setVideoPreview(URL.createObjectURL(files[0]));
  };

  const handleProcessing = (percent: number) => {
    setProcess((prev) => ({ ...prev, percent: percent >= 95 ? 95 : percent }));
  };

  const handleProgress = (data: UploadProgress, queue: VideoQueueData) => {
    const progress = handleBackgroundProcess(data, queue, userId);
    if (progress) {
      setStoredQueue(progress);
    }
  };

  const handleProcess = async () => {
    setProcess({ active: true, percent: 0 });
    setButtons((prev) =>
      updateStepperButtons(prev, [
        {
          key: "process",
          values: { loading: true, label: "Processing...", disabled: true },
        },
      ])
    );
    const metadata = extractFormData(form);
    if (video && metadata) {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const response = await assetService.uploadFile(
        inspectionId,
        "video",
        video,
        metadata,
        handleProcessing,
        abortController.signal
      );
      if (response.status === 200) {
        setShowProgressStatus({ full: false, half: true });
        setProcess({ active: false, percent: 100 });
        const thumbnailUrl = await generateVideoThumbnail(videoPreview ?? "");
        const queueData: VideoQueueData = {
          uploadId: response.data.uploadId,
          userId,
          name: form.title.value,
          size: video?.size ?? 0,
          percent: 0,
          thumbnailUrl,
        };
        sseService.getUploadProgress(
          response.data.uploadId,
          (data: UploadProgress) => handleProgress(data, queueData)
        );
        success();
        if (canvasView) {
          setShowOptimizedOffCanvas(false);
        }
        setButtons((prev) =>
          updateStepperButtons(prev, [
            {
              key: "process",
              values: { disabled: true, loading: false, label: "Processed" },
            },
          ])
        );
      }
    }
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setVideo(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setProcess({ active: false, percent: 0 });
    setButtons((prev) =>
      updateStepperButtons(prev, [
        {
          key: "process",
          values: { disabled: true, loading: false, label: "Process" },
        },
      ])
    );
  };

  useEffect(() => {
    if (
      video &&
      areAllRequiredFieldsFilled(form) &&
      areAllKeyValuesMatched(form, "error", null)
    ) {
      setButtons((prev) =>
        updateStepperButtons(prev, [
          { key: "process", values: { disabled: false } },
        ])
      );
    } else {
      setButtons((prev) =>
        updateStepperButtons(prev, [
          { key: "process", values: { disabled: true } },
        ])
      );
    }
  }, [form, video]);

  useEffect(() => {
    setForm(createForm());
    setVideo(null);
    setProcess({active: false, percent: 0});
    setButtons(prev => updateStepperButtons(prev, [{key: "process", values: {label: "Process"}}]))
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(undefined);
  }, [time]);

  return (
    <div className="w-full h-full flex flex-col gap-4 border border-platinum p-4 rounded-lg">
      <div
        className={`w-full h-full flex flex-col ${
          !canvasView && "md:flex-row"
        } gap-4`}
      >
        <div
          className={`flex flex-col gap-4 w-full ${!canvasView && "md:w-1/2"}`}
        >
          <Input props={form.title} onChange={handleInput} />
          <TextAreaInput props={form.description} onChange={handleInput} />
        </div>
        <div className={`w-full ${!canvasView && "md:w-1/2"}`}>
          {video && videoPreview ? (
            <div className="w-full flex flex-col gap-2 relative">
              <VideoPlayer
                control={true}
                privateUrl={false}
                url={videoPreview}
                userId={userId}
                className="rounded-lg"
              />
              {process.active && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs flex justify-center items-center truncate text-smokyBlack font-normal">
                    {video?.name}
                  </label>
                  <ProgressBar percent={process.percent} />
                </div>
              )}
              {!canvasView && (
                <IconBox
                  action="delete"
                  icon="delete-icon.svg"
                  onClick={cancelUpload}
                  className="absolute top-2 right-2"
                />
              )}
            </div>
          ) : (
            <FileUpload
              data={fileType}
              onChange={handleFileChange}
              size="large"
            />
          )}
        </div>
      </div>
      <div className="w-full flex justify-end items-center">
        <div className="flex justify-center items-center gap-4">
          {process.active && (
            <span className="text-xs text-royalBlue font-medium">
              Do not refresh or go back during processing.
            </span>
          )}
          {buttons.process && process.percent !== 100 && (
            <StepperButton data={buttons.process} onClick={handleProcess} />
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadVideo;
