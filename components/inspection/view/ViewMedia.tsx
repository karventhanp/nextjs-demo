import WidgetBoard from "@/components/common/WidgetBoard";
import VideosWidget from "../widgets/VideosWidget";
import ImagesWidget from "../widgets/ImagesWidget";
import AllObservationsWidget from "../widgets/AllObservationsWidget";
import { useEffect, useRef, useState } from "react";
import { NumberTabData, WidgetData } from "@/types/common";
import NumberTab from "@/components/common/NumberTab";
import { switchNumberTab, updateActionButton } from "@/helpers/helper";
import Image from "next/image";
import { assetService } from "@/services/assetService";
import { useAppContext } from "@/context/AppContext";
import { ImageDefectMeta, VideoData } from "@/types/response";
import Loader from "@/components/common/Loader";
import UploadVideo from "../create/UploadVideo";
import { inspectionService } from "@/services/inspectionService";
import {
  ActionButtonData,
  ActionButtons,
  StepperButtonData,
  StepperButtons,
} from "@/types/button";
import { ActionButton, StepperButton } from "@/components/common/Buttons";
import TerminalViewer from "@/components/common/Terminal";
import { sseService } from "@/services/sseService";
import Alert from "@/components/common/Alert";
import { AiProcessEvents, UploadProgress } from "@/types/service";
import LottiePlayer from "@/components/common/LottiePlayer";
import aiLoading from "@/public/animations/ai-loading.json";
import { VideosWidgetRef } from "@/types/inpection";

const ViewMedia = () => {
  const initialTabId: number = 1;
  const [widgetData, setWidgetData] = useState<Record<number, WidgetData[]>>({
    [initialTabId]: [],
  });
  const [tabs, setTabs] = useState<NumberTabData>({
    active: initialTabId,
    tabs: [{ id: initialTabId }],
  });
  const {
    inspectionId,
    setActiveTimeStamp,
    setShowOptimizedOffCanvas,
    setOptimizedOffCanvasContent,
    sideBar,
    allowedActions,
    setShowOptimizedPopup,
    setOptimizedPopupContent,
    setShowSideBar,
    handleNewWindow,
  } = useAppContext();
  const [videos, setVideos] = useState<Record<number, VideoData>>({});
  const [defectImages, setDefectImages] = useState<
    Record<number, ImageDefectMeta[]>
  >({});
  const [observationImages, setObservationImages] = useState<
    Record<number, ImageDefectMeta[]>
  >({});
  const [loading, setLoading] = useState<boolean>(true);
  const [form, setForm] = useState<
    Record<number, { title: string; description: string }>
  >({});
  const [showSaveButton, setShowSaveButton] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [actions, setActions] = useState<Record<number, ActionButtons>>({});
  const [aiProcess, setAiProcess] = useState<
    Record<number, { active: boolean; completed: boolean; failed: boolean }>
  >({});
  const [aiLogs, setAiLogs] = useState<Record<number, string[]>>({});
  const [aiButtons, setAiButtons] = useState<Record<number, StepperButtons>>(
    {}
  );
  const [terminals, setTerminals] = useState<
    Record<number, { progress: number; clear: boolean }>
  >({});
  const videosWidgetRef = useRef<VideosWidgetRef>(null);

  const addTab = () => {
    setOptimizedOffCanvasContent({
      title: "Upload Video",
      content: (
        <UploadVideo
          time={Date.now()}
          success={() => getVideos()}
          canvasView={true}
        />
      ),
    });
    setShowOptimizedOffCanvas(true);
  };

  const switchTab = (id: number) => {
    setTabs((prev) => switchNumberTab(prev, id));
  };

  const processEssentials = (videos: VideoData[]) => {
    const updatedActions: Record<number, ActionButtons> = {};
    const updatedAiProcess: Record<
      number,
      { active: boolean; completed: boolean; failed: boolean }
    > = {};
    const updatedAiLogs: Record<number, string[]> = {};
    const updatedAiButtons: Record<number, StepperButtons> = {};
    const updatedTerminals: Record<
      number,
      { progress: number; clear: boolean }
    > = {};

    videos.forEach((video, index) => {
      const tabId = index + 1;

      updatedActions[tabId] = {
        delete: {
          disabled: false,
          icon: "delete-icon.svg",
          label: "Delete Media",
          loading: false,
          name: "delete",
        },
        primary: {
          disabled: false,
          icon: "spark.svg",
          label: "AI Analyse",
          loading: false,
          name: "primary",
        },
      };

      updatedAiProcess[tabId] = {
        active: !!video.inferenceMessage,
        completed: false,
        failed: false,
      };

      updatedAiLogs[tabId] = [];

      updatedAiButtons[tabId] = {
        submit: {
          disabled: false,
          label: "Continue",
          name: "submit",
          loading: false,
        },
        cancel: {
          disabled: false,
          label: "Back",
          name: "cancel",
          loading: false,
        },
      };

      updatedTerminals[tabId] = {
        progress: 0,
        clear: false,
      };
    });

    setActions((prev) => ({ ...prev, ...updatedActions }));
    setAiProcess((prev) => ({ ...prev, ...updatedAiProcess }));
    setAiLogs((prev) => ({ ...prev, ...updatedAiLogs }));
    setAiButtons((prev) => ({ ...prev, ...updatedAiButtons }));
    setTerminals((prev) => ({ ...prev, ...updatedTerminals }));
  };

  const getVideos = async () => {
    setLoading(true);
    const response = await assetService.getFilesByCategory(
      inspectionId,
      "video"
    );
    if (response.status === 200) {
      const data: VideoData[] = response.data;
      const videosByTab: Record<number, VideoData> = {};
      const defectImagesByTab: Record<number, ImageDefectMeta[]> = {};
      const observationImagesByTab: Record<number, ImageDefectMeta[]> = {};
      const videoMetasByTab: Record<
        number,
        { title: string; description: string }
      > = {};
      const tabList = data.map((_, index) => ({ id: index + 1 }));

      data.forEach((video, index) => {
        const tabId = index + 1;
        videosByTab[tabId] = video;
        const defectImages: ImageDefectMeta[] = [];
        const observationImages: ImageDefectMeta[] = [];
        const videoMeta: { title: string; description: string } = {
          title: video.title,
          description: video.description,
        };

        (video.imagesTimestampFields || []).forEach((img) => {
          if (img.defect) {
            defectImages.push(img);
          } else {
            observationImages.push(img);
          }
        });
        videoMetasByTab[tabId] = videoMeta;
        defectImagesByTab[tabId] = defectImages;
        observationImagesByTab[tabId] = observationImages;
      });
      processEssentials(data);
      setTabs((prev) => ({ ...prev, tabs: tabList }));
      setForm(videoMetasByTab);
      setVideos(videosByTab);
      setDefectImages(defectImagesByTab);
      setObservationImages(observationImagesByTab);
    } else {
      setVideos({});
    }
    setLoading(false);
  };

  const handleTimeUpdate = (time: string) => {
    setActiveTimeStamp(time);
  };

  const updateVideoMeta = async (videoId: string) => {
    const tabId = tabs.active;
    setSaveLoading(true);
    const response = await inspectionService.updateVideoMeta(videoId, {
      title: form[tabId].title,
      description: form[tabId].description,
    });
    if (response.status === 200) {
      setShowSaveButton(false);
      setSaveLoading(false);
      getVideos();
    }
    setSaveLoading(false);
  };

  const handleInput = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [tabs.active]: {
        ...prev[tabs.active],
        [key]: value,
      },
    }));
  };

  const handleAiLogs = (event: AiProcessEvents, logs: string) => {
    const tabId = tabs.active;
    if (event === "status") {
      if (logs === "COMPLETED") {
        setTerminals((prev) => ({
          ...prev,
          [tabId]: { clear: true, progress: 0 },
        }));
      } else if (logs === "FAILED") {
        setAiProcess((prev) => ({
          ...prev,
          [tabId]: { active: true, completed: false, failed: true },
        }));
      }
    } else if (event === "oss_id" && logs.trim() !== "") {
      getUploadProgress(logs);
    }
    if (event !== "oss_id") {
      setAiLogs((prev) => ({
        ...prev,
        [tabId]: [logs],
      }));
    }
  };

  const getUploadProgress = (uploadId: string) => {
    sseService.getUploadProgress(uploadId, (progress: UploadProgress) => {
      setTerminals((prev) => ({
        ...prev,
        [tabs.active]: { clear: false, progress: progress.progressPercentage },
      }));
      if (progress.progressPercentage === 100) {
        setAiProcess((prev) => ({
          ...prev,
          [tabs.active]: { ...prev[tabs.active], completed: true },
        }));
      }
    });
  };

  const triggerAIAnalyse = async (videoId: string) => {
    const tabId = Object.entries(videos).find(
      ([_, video]) => video.videoId === videoId
    )?.[0];
    if (!tabId) return;

    setAiProcess((prev) => ({
      ...prev,
      [Number(tabId)]: { ...prev[Number(tabId)], active: true },
    }));
    const response = await inspectionService.triggerAiAnalyse(videoId);
    if (response.status === 202) {
      sseService.getAIProgress(videoId, handleAiLogs);
    }
  };

  const showAlert = () => {
    setOptimizedPopupContent({
      title: "Alert",
      content: (
        <Alert
          message="AI Analysis will replace your manual entries. Are you sure you want to proceed?"
          icon="info-yellow.svg"
          onClick={(proceed) => {
            if (proceed) {
              triggerAIAnalyse(videos[tabs.active].videoId);
              setShowOptimizedPopup(false);
            } else {
              setShowOptimizedPopup(false);
            }
          }}
        />
      ),
      hideHeader: true,
    });
    setShowOptimizedPopup(true);
  };

  const deleteMedia = async () => {
    setActions((prev) => ({
      ...prev,
      [tabs.active]: updateActionButton(prev[tabs.active], [
        { key: "delete", values: { disabled: true, loading: true } },
      ]),
    }));
    const videoId = videos[tabs.active].videoId;
    const response = await assetService.deleteFileById("video", videoId);
    if (response.status === 200) {
      setTabs((prev) => ({
        ...prev,
        active: prev.active - 1 <= 1 ? 1 : prev.active - 1,
      }));
      getVideos();
    }
    setActions((prev) => ({
      ...prev,
      [tabs.active]: updateActionButton(prev[tabs.active], [
        { key: "delete", values: { disabled: false, loading: false } },
      ]),
    }));
  };

  const clearAIProcess = () => {
    const tabId = tabs.active;
    setAiProcess((prev) => ({
      ...prev,
      [tabId]: { active: false, completed: true, failed: false },
    }));
    setAiLogs((prev) => ({ ...prev, [tabId]: [] }));
    getVideos();
  };

  const jumtoVideoFrame = (img: ImageDefectMeta) => {
    if (videosWidgetRef.current && videosWidgetRef.current.jumtoVideoFrame) {
      videosWidgetRef.current.jumtoVideoFrame(img.timestamp);
    }
  };

  useEffect(() => {
    if (Object.keys(videos).length > 0) {
      const updated: Record<number, WidgetData[]> = {};
      Object.entries(videos).forEach(([tabId, video]) => {
        const tid = Number(tabId);
        updated[tid] = ([
          sideBar.active.includes(2) && {
            content: (
              <VideosWidget
                ref={videosWidgetRef}
                video={video}
                success={getVideos}
                onTimeUpdate={handleTimeUpdate}
              />
            ),
            layout: { i: `videos-${tid}`, x: 0, y: 0, h: 4, w: 8, minW: 4, minH: 2 },
          },
          sideBar.active.includes(3) && {
            content: (
              <ImagesWidget
                images={defectImages[tid] || []}
                success={getVideos}
                onImageClick={jumtoVideoFrame}
              />
            ),
            layout: { i: `images-${tid}`, x: 8, y: 0, h: 4, w: 4, minW: 4, minH: 2 },
          },
          sideBar.active.includes(4) && {
            content: (
              <AllObservationsWidget
                defectImages={defectImages[tid] || []}
                observationImages={observationImages[tid] || []}
                videoId={videos[tid].videoId}
                success={getVideos}
                onClick={jumtoVideoFrame}
              />
            ),
            layout: { i: `observations-${tid}`, x: 0, y: 1, h: 4, w: 12, minW: 6, minH: 2 },
          },
        ] as WidgetData[] ).filter(Boolean);
      });
      setWidgetData(updated);
    }
  }, [videos, defectImages, observationImages, sideBar]);

  useEffect(() => {
    if (videos) {
      setShowSideBar(Object.keys(videos).length > 0);
    }
  }, [videos]);

  useEffect(() => {
    if (Object.keys(videos).length > 0) {
      Object.entries(videos).map(([tabId, video]) => {
        if (video.inferenceStatus) {
          triggerAIAnalyse(video.videoId);
        }
      });
    }
  }, [videos]);

  useEffect(() => {
    getVideos();

    return () => {
      handleNewWindow({type: 'close', id: -1});
    }
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {loading ? (
        <div className="m-auto">
          <Loader />
        </div>
      ) : (
        <>
          {Object.keys(videos).length > 0 && tabs.tabs.length > 0 ? (
            <>
              <div className="flex w-full gap-4 justify-between items-center">
                <div className="flex gap-4 w-full items-center">
                  <NumberTab
                    data={tabs}
                    createTab={addTab}
                    switchTab={switchTab}
                    canRemoveTab={false}
                  />
                  <div className="flex w-full gap-4 items-center">
                    <div className="flex w-full flex-col">
                      <input
                        type="text"
                        value={form[tabs.active].title ?? ""}
                        name="title"
                        onFocus={() => setShowSaveButton(true)}
                        onChange={(e) =>
                          handleInput(e.target.name, e.target.value)
                        }
                        autoComplete="off"
                        className="outline-none bg-transparent hover:border-b hover:border-primary border-t-0 text-md w-full font-medium text-smokyBlack border-l-0 border-r-0 border-b-0 ring-0 p-0 focus:ring-0 focus:border-primary focus:border-t-0 focus:border-l-0 focus:border-r-0 focus:border-b"
                      />
                      <input
                        type="text"
                        name="description"
                        value={form[tabs.active].description ?? ""}
                        onFocus={() => setShowSaveButton(true)}
                        onChange={(e) =>
                          handleInput(e.target.name, e.target.value)
                        }
                        autoComplete="off"
                        className="outline-none bg-transparent w-full hover:border-b hover:border-primary border-t-0 border-l-0 text-sm font-normal text-liver border-r-0 border-b-0 ring-0 p-0 focus:ring-0 focus:border-primary focus:border-t-0 focus:border-l-0 focus:border-r-0 focus:border-b"
                      />
                    </div>
                    <button
                      className={`bg-snow w-fit min-w-fit text-smokyBlack border border-platinum font-medium h-10 text-sm rounded-md ${
                        showSaveButton ? "flex" : "hidden"
                      } gap-2 justify-center items-center p-2`}
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          [tabs.active]: {
                            title: videos[tabs.active].title,
                            description: videos[tabs.active].description,
                          },
                        }));
                        setShowSaveButton(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className={`bg-primary w-fit min-w-fit text-snow font-medium h-10 text-sm rounded-md ${
                        showSaveButton ? "flex" : "hidden"
                      } gap-2 justify-center items-center p-2 disabled:cursor-not-allowed`}
                      onClick={() =>
                        updateVideoMeta(videos[tabs.active].videoId)
                      }
                      disabled={saveLoading}
                    >
                      <Image
                        src="/images/loading-black.svg"
                        className={`animate-spin ${!saveLoading && "hidden"}`}
                        alt="loading"
                        width={16}
                        height={16}
                      />
                      Save
                    </button>
                  </div>
                </div>
                {!aiProcess[tabs.active].active && (
                  <div className="flex w-fit gap-4 min-w-fit">
                    {videos[tabs.active].isAIInference ? (
                      <></>
                    ) : (
                      actions &&
                      actions[tabs.active].primary && (
                        <ActionButton
                          data={
                            actions[tabs.active].primary as ActionButtonData
                          }
                          onClick={showAlert}
                        />
                      )
                    )}
                    {actions && actions[tabs.active]?.delete && (
                      <ActionButton
                        data={actions[tabs.active].delete as ActionButtonData}
                        onClick={deleteMedia}
                      />
                    )}
                  </div>
                )}
              </div>
              <div className="w-full h-full">
                {aiProcess[tabs.active].active ? (
                  <div className="w-full h-full flex flex-col relative">
                    <div className="w-full bg-lightGray rounded-t-md p-2 h-12 flex gap-2 items-center">
                      {terminals[tabs.active].progress !== 100 ? (
                        <LottiePlayer
                          animationData={aiLoading}
                          style={{ height: 32, width: 32 }}
                        />
                      ) : (
                        <Image
                          src="/images/tick-primary.svg"
                          width={24}
                          height={24}
                          alt="Done"
                        />
                      )}
                      <h5 className="text-sm text-smokyBlack font-medium">
                        {terminals[tabs.active].progress === 100
                          ? "Completed"
                          : "AI Processing..."}
                      </h5>
                    </div>
                    <TerminalViewer
                      data={aiLogs[tabs.active]}
                      clear={terminals[tabs.active].clear}
                      progress={terminals[tabs.active].progress}
                      style={{ height: "100%", width: "100%" }}
                    />
                    <div className="absolute bottom-4 right-2">
                      {aiProcess[tabs.active].completed &&
                        aiButtons &&
                        aiButtons[tabs.active] && (
                          <StepperButton
                            data={
                              aiButtons[tabs.active].submit as StepperButtonData
                            }
                            onClick={clearAIProcess}
                          />
                        )}
                      {aiProcess[tabs.active].failed &&
                        aiButtons &&
                        aiButtons[tabs.active] && (
                          <StepperButton
                            data={
                              aiButtons[tabs.active].cancel as StepperButtonData
                            }
                            onClick={clearAIProcess}
                          />
                        )}
                    </div>
                  </div>
                ) : (
                  <WidgetBoard data={widgetData[tabs.active]} />
                )}
              </div>
            </>
          ) : (
            <div className="w-full">
              <UploadVideo success={() => getVideos()} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ViewMedia;
