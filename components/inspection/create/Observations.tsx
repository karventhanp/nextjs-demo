import {
  InspectionPagePropsLegacy,
  Process,
  VideoQueueData,
} from "@/types/inpection";
import { useEffect, useRef, useState } from "react";
import { NumberTabData } from "@/types/common";
import NumberTab from "@/components/common/NumberTab";
import { FormState } from "@/types/input";
import SharedVideoUpload from "./SharedVideoUpload";
import {
  addNumberTab,
  areAllKeyValuesMatched,
  areAllRequiredFieldsFilled,
  extractFormData,
  handleBackgroundProcess,
  processInspectionDataKeyandValue,
  removeNumberTab,
  switchNumberTab,
  updateStepperButtons,
} from "@/helpers/helper";
import { StepperButtons } from "@/types/button";
import { assetService } from "@/services/assetService";
import { sseService } from "@/services/sseService";
import {
  generateVideoThumbnail,
  getLocalStorage,
  setLocalStorage,
} from "@/utils/utils";
import { useAppContext } from "@/context/AppContext";
import { UploadProgress } from "@/types/service";
import Constants from "@/constants/constants";
import { StepperButton } from "@/components/common/Buttons";
import { VideoData } from "@/types/response";

const Observations: React.FC<InspectionPagePropsLegacy> = ({
  updatePage = () => {},
}) => {
  const initialTabId: number = 1;
  const [tabs, setTabs] = useState<NumberTabData>({
    active: initialTabId,
    tabs: [{ id: initialTabId }],
  });
  const createFormEntry = (): FormState => ({
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
  const createProcessEntry = (): Process => ({ active: false, percent: 0 });
  const createSharedButtonEntry = (): StepperButtons => ({
    submit: {
      disabled: false,
      label: "Submit",
      name: "submit",
      loading: false,
    },
    process: {
      disabled: false,
      label: "Process",
      name: "process",
      loading: false,
    },
  });

  const [form, setForm] = useState<Record<number, FormState>>({
    [initialTabId]: createFormEntry(),
  });
  const [video, setVideo] = useState<Record<number, File | null>>({
    [initialTabId]: null,
  });
  const [process, setProcess] = useState<Record<number, Process>>({
    [initialTabId]: createProcessEntry(),
  });
  const [preview, setPreview] = useState<Record<number, string>>({
    [initialTabId]: "",
  });
  const [sharedButtons, setSharedButtons] = useState<
    Record<number, StepperButtons>
  >({ [initialTabId]: createSharedButtonEntry() });
  const [showProcessButton, setShowProcessButton] = useState<
    Record<number, boolean>
  >({ [initialTabId]: false });
  const [privateUrl, setPrivateUrl] = useState<Record<number, boolean>>({});
  const [buttons, setButtons] = useState<StepperButtons>({
    next: { disabled: false, label: "Next", name: "next", loading: false },
    back: { disabled: false, label: "Back", name: "back", loading: false },
    skip: { disabled: false, label: "Skip", name: "skip", loading: false },
    cancel: {
      disabled: false,
      label: "Cancel",
      name: "cancel",
      loading: false,
    },
  });
  const [existingVideos, setExistingVideos] = useState<VideoData[]>([]);
  const [showSkip, setShowSkip] = useState<boolean>(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { userId, setStoredQueue, storedQueue, setShowProgressStatus } =
    useAppContext();

  const createEssentials = (id: number) => {
    setForm((prev) => ({ ...prev, [id]: createFormEntry() }));
    setVideo((prev) => ({ ...prev, [id]: null }));
    setPreview((prev) => ({ ...prev, [id]: "" }));
    setProcess((prev) => ({
      ...prev,
      [id]: createProcessEntry(),
    }));
    setSharedButtons((prev) => ({
      ...prev,
      [id]: createSharedButtonEntry(),
    }));
    setShowProcessButton((prev) => ({ ...prev, [id]: false }));
    setPrivateUrl((prev) => ({ ...prev, [id]: false }));
  };

  const removeEssentials = (id: number) => {
    setForm((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    setVideo((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    URL.revokeObjectURL(preview[id]);
    setPreview((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    setProcess((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    setSharedButtons((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    setShowProcessButton((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    setPrivateUrl((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const addTab = () => {
    setTabs((prev) => {
      const updated = addNumberTab(prev);
      const newId = updated.tabs[updated.tabs.length - 1].id;
      createEssentials(newId);
      return updated;
    });
  };

  const removeTab = (id: number) => {
    if (existingVideos.length > 0 && existingVideos[id - 1]) {
      deleteVideo();
    }
    if (tabs.tabs.length > 1) {
      setTabs((prev) => {
        const updated = removeNumberTab(prev, id);
        removeEssentials(id);
        return updated;
      });
    }
  };

  const switchTab = (id: number) => {
    setTabs((prev) => switchNumberTab(prev, id));
  };

  const hasAnyDataInAllTabs = (
    form: Record<number, FormState>,
    preview: Record<number, string>,
    video: Record<number, File | null>
  ): boolean => {
    for (const tabId of Object.keys(form)) {
      const formEntry = form[Number(tabId)];

      const hasFormValues = Object.values(formEntry || {}).some((field) => {
        return (
          field?.value !== null &&
          field?.value !== undefined &&
          field?.value !== ""
        );
      });

      const hasPreview = !!preview[Number(tabId)];
      const hasVideo = !!video[Number(tabId)];

      if (hasFormValues || hasPreview || hasVideo) {
        return true;
      }
    }

    return false;
  };

  const handleInput = (key: string, value: string) => {
    const activeId = tabs.active;

    setForm((prev) => {
      const currentForm = prev[activeId] || createFormEntry();
      let error = null;
      if (currentForm[key as keyof FormState].required === true) {
        error = value.trim() === "" ? "This field is required." : null;
      }
      const updatedForm = updateFormState(currentForm, key, value, error);
      return {
        ...prev,
        [activeId]: updatedForm,
      };
    });
  };

  const updateFormState = (
    prev: FormState,
    key: string,
    value: string,
    error: string | null
  ): FormState => {
    return {
      ...prev,
      [key]: {
        ...prev[key],
        value,
        error,
      },
    };
  };

  const handleFile = (file: File[] | null) => {
    if (file) {
      const activeId = tabs.active;
      setVideo((prev) => ({ ...prev, [activeId]: file[0] }));
      setPrivateUrl((prev) => ({ ...prev, [activeId]: false }));
      setPreview((prev) => ({
        ...prev,
        [activeId]: URL.createObjectURL(file[0]),
      }));
    }
  };

  const handleProcess = (percent: number) => {
    setProcess((prev) => ({
      ...prev,
      [tabs.active]: { active: true, percent: percent >= 95 ? 95 : percent },
    }));
  };

  const handleProgress = (data: UploadProgress, queue: VideoQueueData) => {
    const progress = handleBackgroundProcess(data, queue, userId);
    if (progress) {
      setStoredQueue(progress);
    }
  };

  const uploadFile = async () => {
    const activeId = tabs.active;
    setProcess((prev) => ({
      ...prev,
      [activeId]: { active: true, percent: 0 },
    }));
    setButtons((prev) =>
      updateStepperButtons(prev, [{ key: "skip", values: { disabled: true } }])
    );
    setSharedButtons((prev) => ({
      ...prev,
      [activeId]: updateStepperButtons(prev[activeId], [
        {
          key: "process",
          values: { disabled: true, loading: true, label: "Processing..." },
        },
      ]),
    }));
    const metadata = extractFormData(form[activeId]);
    const inspectionId = getLocalStorage(Constants.INSPECTION_ID);
    if (video[activeId] && metadata && inspectionId) {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const response = await assetService.uploadFile(
        inspectionId,
        "video",
        video[activeId],
        metadata,
        handleProcess,
        abortController.signal
      );
      if (response.status === 200) {
        setProcess((prev) => ({
          ...prev,
          [activeId]: { active: false, percent: 100 },
        }));
        const thumbnailUrl = await generateVideoThumbnail(preview[activeId]);
        const queueData: VideoQueueData = {
          uploadId: response.data.uploadId,
          userId,
          name: form[activeId].title.value,
          size: video[activeId]?.size ?? 0,
          percent: 0,
          thumbnailUrl,
        };
        sseService.getUploadProgress(
          response.data.uploadId,
          (data: UploadProgress) => handleProgress(data, queueData)
        );
        setSharedButtons((prev) => ({
          ...prev,
          [activeId]: updateStepperButtons(prev[activeId], [
            {
              key: "process",
              values: { disabled: true, loading: false, label: "Processed" },
            },
          ]),
        }));
      } else {
        setProcess((prev) => ({
          ...prev,
          [activeId]: { active: false, percent: 0 },
        }));
        setSharedButtons((prev) => ({
          ...prev,
          [activeId]: updateStepperButtons(prev[activeId], [
            {
              key: "process",
              values: { disabled: true, loading: false, label: "Process" },
            },
          ]),
        }));
      }

      setShowProcessButton((prev) => ({ ...prev, [activeId]: false }));
    }
  };

  const deleteVideo = async () => {
    const activeId = tabs.active - 1;
    if (existingVideos[activeId]) {
      await assetService.deleteFileById(
        "video",
        existingVideos[activeId].videoId
      );
      if (tabs.tabs.length > 1) {
        switchTab(tabs.active);
      }
    }
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const activeId = tabs.active;
    if (existingVideos.length > 0) {
      removeTab(activeId);
    }
    setVideo((prev) => ({ ...prev, [activeId]: null }));
    URL.revokeObjectURL(preview[tabs.active]);
    setPreview((prev) => ({ ...prev, [activeId]: "" }));
    setProcess((prev) => ({ ...prev, [activeId]: createProcessEntry() }));
    setSharedButtons((prev) => ({
      ...prev,
      [activeId]: createSharedButtonEntry(),
    }));
  };

  const handleBack = () => {
    setLocalStorage("COMPIID", JSON.stringify([1]));
    updatePage(2, false);
  };

  const createTabs = (length: number) => {
    const existingTabs = tabs.tabs.length;
    const requiredTabs = length;

    if (requiredTabs > existingTabs) {
      const updatedTabs = { ...tabs };
      for (let i = 0; i < requiredTabs - existingTabs; i++) {
        const newId = Math.max(...updatedTabs.tabs.map((t) => t.id)) + 1;
        updatedTabs.tabs.push({ id: newId });
        createEssentials(newId);
      }
      setTabs(updatedTabs);
    }
  };

  const getVideos = async () => {
    const inspectionId = getLocalStorage(Constants.INSPECTION_ID);
    if (inspectionId) {
      const response = await assetService.getFilesByCategory(
        inspectionId,
        "video"
      );
      if (response.status === 200) {
        setExistingVideos(response.data);
        createTabs(response.data.length);
        processToShowVideos(response.data);
      }
    }
  };

  const processToShowVideos = (videos: VideoData[]) => {
    tabs.tabs.map((_, index) => {
      const tabId = index + 1;
      processInspectionDataKeyandValue(videos[index], (key, value) =>
        setForm((prev) => ({
          ...prev,
          [tabId]: updateFormState(prev[tabId], key, value, null),
        }))
      );
      setPrivateUrl((prev) => ({ ...prev, [tabId]: true }));
      setPreview((prev) => ({ ...prev, [tabId]: videos[index].videoUrl }));
    });
  };

  useEffect(() => {
    const activeId = tabs.active;
    if (video[activeId]) {
      setShowProcessButton((prev) => ({ ...prev, [activeId]: true }));
    } else {
      setShowProcessButton((prev) => ({ ...prev, [activeId]: false }));
    }
  }, [video[tabs.active]]);

  useEffect(() => {
    const activeId = tabs.active;
    if (
      areAllRequiredFieldsFilled(form[activeId]) &&
      areAllKeyValuesMatched(form[activeId], "error", null) &&
      video[activeId]
    ) {
      setSharedButtons((prev) => ({
        ...prev,
        [activeId]: updateStepperButtons(prev[activeId], [
          { key: "process", values: { disabled: false } },
        ]),
      }));
    } else {
      setSharedButtons((prev) => ({
        ...prev,
        [activeId]: updateStepperButtons(prev[activeId], [
          { key: "process", values: { disabled: true } },
        ]),
      }));
    }
  }, [form[tabs.active], video[tabs.active]]);

  useEffect(() => {
    if (hasAnyDataInAllTabs(form, preview, video)) {
      setShowSkip(false);
    } else {
      setShowSkip(true);
    }
  }, [form, video]);

  useEffect(() => {
    getVideos();
    return () => {
      Object.values(preview).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex items-center justify-start">
        <NumberTab
          data={tabs}
          createTab={addTab}
          switchTab={switchTab}
          removeTab={removeTab}
          canRemoveTab={true}
        />
      </div>
      <div className="w-full">
        {tabs.tabs.find((tab) => tab.id == tabs.active) && (
          <div className="flex w-full">
            <SharedVideoUpload
              form={form[tabs.active]}
              video={video[tabs.active]}
              process={process[tabs.active]}
              preview={preview[tabs.active]}
              buttons={sharedButtons[tabs.active]}
              showProcessButton={showProcessButton[tabs.active]}
              privateUrl={privateUrl[tabs.active]}
              onChange={handleInput}
              onFileChange={handleFile}
              uploadFile={uploadFile}
              cancelUpload={cancelUpload}
            />
          </div>
        )}
      </div>
      <div className="w-full flex justify-end gap-4 items-center">
        {buttons.back && (
          <StepperButton data={buttons.back} onClick={handleBack} />
        )}
        {(storedQueue.length > 0 || !showSkip) && buttons.next && (
          <StepperButton
            data={buttons.next}
            onClick={() => {
              setLocalStorage("COMPIID", JSON.stringify([1, 2, 3]));
              updatePage(4, false);
              setShowProgressStatus({ full: false, half: true });
            }}
          />
        )}
        {storedQueue.length === 0 && showSkip && buttons.skip && (
          <StepperButton
            data={buttons.skip}
            onClick={() => updatePage(4, true)}
          />
        )}
      </div>
    </div>
  );
};

export default Observations;
