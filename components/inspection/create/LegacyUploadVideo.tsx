import { Input, TextAreaInput } from "@/components/common/Inputs";
import FileUpload from "@/components/common/FileUpload";
import { useEffect, useRef, useState } from "react";
import { FileUploadData } from "@/types/common";
import { StepperButtons } from "@/types/button";
import { StepperButton } from "@/components/common/Buttons";
import { assetService } from "@/services/assetService";
import {
  getLocalStorage,
  setLocalStorage,
  generateVideoThumbnail,
  removeLocalStorage,
} from "@/utils/utils";
import {
  areAllKeyValuesMatched,
  areAllRequiredFieldsFilled,
} from "@/helpers/helper";
import { updateStepperButtons, extractFormData } from "@/helpers/helper";
import { FormState } from "@/types/input";
import { ProgressBar } from "@/components/common/Progress";
import Image from "next/image";
import { VideoQueueData } from "@/types/inpection";
import VideoQueue from "../common/VideoQueue";
import { useAppContext } from "@/context/AppContext";
import { InspectionPagePropsLegacy } from "@/types/inpection";
import { sseService } from "@/services/sseService";
import { UploadProgress } from "@/types/service";
import Constants from "@/constants/constants";

interface UploadVideoProps {
  sharedVideo?: File | null;
}
const LegacyUploadVideo: React.FC<InspectionPagePropsLegacy & UploadVideoProps> = ({
  updatePage = () => {},
  viewData,
  viewFlow,
  sharedVideo,
  cancel = () => {},
}) => {
  const [form, setForm] = useState<FormState>({
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
  const [fileType, setFileType] = useState<FileUploadData>({
    imgUrl: "upload-video.svg",
    multiple: false,
    format: { label: "MP4, AVI, WEBM", type: ".mp4, , .avi, .webm" },
    type: "video",
  });
  const [buttons, setButtons] = useState<StepperButtons>({
    process: {
      disabled: true,
      label: "Process",
      name: "process",
      loading: false,
    },
    back: { disabled: false, label: "Back", name: "back", loading: false },
    skip: { disabled: false, label: "Skip", name: "skip", loading: false },
    next: { disabled: false, label: "Next", name: "next", loading: false },
    more: { disabled: false, label: "Add more", name: "more", loading: false },
    submit: { disabled: true, label: "Submit", name: "submit", loading: false },
    cancel: {
      disabled: false,
      label: "Cancel",
      name: "cancel",
      loading: false,
    },
  });
  const [video, setVideo] = useState<File | null>(null);
  const [process, setProcess] = useState<{ active: boolean; percent: number }>({
    active: false,
    percent: 0,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showMore, setShowMore] = useState<boolean>(false);
  const { storedQueue, setStoredQueue, setShowProgressStatus } =
    useAppContext();
  const abortControllerRef = useRef<AbortController | null>(null);
  const { inspectionId, userId } = useAppContext();

  const handleInput = (key: string, value: string) => {
    setForm((prev) => {
      let error = null;
      if (prev[key as keyof FormState].required === true) {
        error = value.trim() === "" ? "This field is required." : null;
      }
      return {
        ...prev,
        [key]: { ...prev[key as keyof FormState], value: value, error: error },
      };
    });
  };

  const handleSetVideo = (file: File) => {
    setVideo(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const uploadFile = async () => {
    setProcess({ active: true, percent: 0 });
    setButtons((prev) =>
      updateStepperButtons(prev, [
        { key: "process", values: { disabled: true, loading: true } },
        { key: "skip", values: { disabled: true } },
      ])
    );
    const metadata = extractFormData(form);
    if (video && metadata) {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      let inspecId = inspectionId;
      if (!viewFlow) {
        const id = getLocalStorage("IID");
        if (id) inspecId = id;
      }
      const response = await assetService.uploadFile(
        inspecId,
        "video",
        video,
        metadata,
        handleProcessing,
        abortController.signal
      );
      if (response.status === 200) {
        setProcess({ active: false, percent: 100 });
        if (!getLocalStorage(Constants.INSPECTION_ID)) {
          setShowProgressStatus({ half: true, full: false });
        }
        setShowMore(true);
        const thumbnailUrl = await generateVideoThumbnail(previewUrl ?? "");
        const queueData: VideoQueueData = {
          uploadId: response.data.uploadId,
          userId,
          name: form.title.value,
          size: video.size,
          percent: 0,
          thumbnailUrl,
        };
        sseService.getUploadProgress(
          response.data.uploadId,
          (data: UploadProgress) => handleBackgroundProcess(data, queueData)
        );
      }
      setButtons((prev) =>
        updateStepperButtons(prev, [
          { key: "process", values: { loading: false } },
        ])
      );
    }
  };

  const storeVideoQueue = (newQueueItem: VideoQueueData) => {
    const existing: VideoQueueData[] = JSON.parse(
      getLocalStorage("progress") ?? "[]"
    );
    const updated = existing.map((queue) =>
      queue.uploadId === newQueueItem.uploadId ? newQueueItem : queue
    );
    const isNew = !existing.find(
      (queue) => queue.uploadId === newQueueItem.uploadId
    );
    if (isNew) updated.push(newQueueItem);
    setLocalStorage("progress", JSON.stringify(updated));
    setStoredQueue(updated);
  };

  const handleBackgroundProcess = async (
    progress: UploadProgress,
    queue: VideoQueueData
  ) => {
    if (!progress || !progress.uploadId) return;

    const updatedQueue: VideoQueueData = {
      ...queue,
      percent: progress.progressPercentage,
    };

    storeVideoQueue(updatedQueue);

    if (progress.status === "COMPLETED" || progress.progressPercentage >= 100) {
      const existing: VideoQueueData[] = JSON.parse(
        getLocalStorage("progress") ?? "[]"
      );
      const updated = existing.filter(
        (queue) => queue.uploadId !== progress.uploadId
      );
      if (updated.length === 0) {
        removeLocalStorage("progress");
      } else {
        setLocalStorage("progress", JSON.stringify(updated));
      }
      setStoredQueue(updated);
    }
  };

  const clearForm = () => {
    setForm((prev) => ({
      ...prev,
      title: { ...prev.title, value: "" },
      description: { ...prev.description, value: "" },
    }));
    setVideo(null);
    URL.revokeObjectURL(previewUrl ?? "");
    setPreviewUrl(null);
    setShowMore(false);
  };

  const handleProcessing = (percent: number) => {
    setProcess({ active: true, percent: percent >= 95 ? 95 : percent });
  };

  const cancelUpload = () => {
    setVideo(null);
    URL.revokeObjectURL(previewUrl ?? "");
    setPreviewUrl(null);
    setProcess({ active: false, percent: 0 });
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleBack = () => {
    if (viewFlow) {
      cancel();
    }
  };

  useEffect(() => {
    if (sharedVideo) {
      handleSetVideo(sharedVideo);
    }
  }, [sharedVideo]);

  useEffect(() => {
    if (
      areAllRequiredFieldsFilled(form) &&
      areAllKeyValuesMatched(form, "error", null) &&
      video
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
  }, [video, form]);

  return (
    <div className="flex w-full flex-col h-full gap-4">
      <div className="w-full flex flex-col gap-4 p-4 border rounded-lg">
        <div className="w-full flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2 flex h-full flex-col gap-4">
            <Input props={form.title} onChange={handleInput} />
            <TextAreaInput props={form.description} onChange={handleInput} />
          </div>
          <div className="w-full md:w-1/2">
            {video ? (
              <div className="w-full flex flex-col gap-2 border border-platinum rounded-lg">
                <div className="w-full h-full relative">
                  <video
                    src={previewUrl ?? ""}
                    controls
                    className={`w-full h-full ${
                      process.active ? "rounded-t-lg" : "rounded-lg"
                    }`}
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
                onChange={(files) => handleSetVideo(files[0])}
                size="large"
              />
            )}
          </div>
        </div>
        <div className="w-full gap-4 flex justify-end items-center">
          {showMore && buttons.more && (
            <StepperButton data={buttons.more} onClick={clearForm} />
          )}
          {buttons.process && video && (
            <StepperButton data={buttons.process} onClick={uploadFile} />
          )}
        </div>
      </div>
      <div className="w-full">
        <VideoQueue />
      </div>
      <div className="w-full flex justify-end items-center gap-4">
        {buttons.back && (
          <StepperButton data={buttons.back} onClick={handleBack} />
        )}
        {storedQueue.length > 0 && buttons.next && !viewFlow && (
          <StepperButton
            data={buttons.next}
            onClick={() => {
              updatePage(2, false);
              setShowProgressStatus({ full: false, half: true });
            }}
          />
        )}
        {storedQueue.length === 0 && buttons.skip && !viewFlow && (
          <StepperButton
            data={buttons.skip}
            onClick={() => updatePage(2, true)}
          />
        )}
      </div>
    </div>
  );
};

export default LegacyUploadVideo;
