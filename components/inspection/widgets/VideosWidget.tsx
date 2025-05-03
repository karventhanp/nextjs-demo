import { IconBox } from "@/components/common/IconBox";
import VideoPlayer from "@/components/common/VideoPlayer";
import { useAppContext } from "@/context/AppContext";
import { VideoData } from "@/types/response";
import Image from "next/image";
import CreateDefect from "../create/CreateDefect";
import {
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { VideoPlayerHandle } from "@/types/common";
import NewWindow from "@/components/common/NewWindow";
import { VideosWidgetRef } from "@/types/inpection";

interface VideosWidgetProps {
  video: VideoData;
  onTimeUpdate?: (currentTime: string) => void;
  success?: () => void;
}

const VideosWidget = forwardRef<VideosWidgetRef, VideosWidgetProps>(
  ({ video, onTimeUpdate = () => {}, success = () => {} }, ref) => {
    const {
      userId,
      setShowOptimizedOffCanvas,
      setOptimizedOffCanvasContent,
      handleNewWindow,
      handleSideBar,
      newWindow,
    } = useAppContext();
    const videoRef = useRef<VideoPlayerHandle>(null);

    const createDefect = () => {
      if (videoRef.current && videoRef.current.captureFrame) {
        const image = videoRef.current?.captureFrame();
        if (!image) return;

        setOptimizedOffCanvasContent({
          title: "Defect",
          content: (
            <CreateDefect
              data={image}
              videoId={video.videoId}
              success={success}
            />
          ),
        });
        setShowOptimizedOffCanvas(true);
      }
    };

    useImperativeHandle(ref, () => ({
      jumtoVideoFrame: (timeStamp: string) => {
        if (videoRef.current && videoRef.current.jumpToVideoFrame)
          videoRef.current.jumpToVideoFrame(timeStamp);
      },
    }));

    const Header = (
      <div className="w-full flex justify-between bg-primary/30 h-12 rounded-t-lg items-center p-2">
        <div className="flex items-center gap-2 w-fit">
          <h5 className="text-sm text-smokyBlack font-medium">Video</h5>
          {video.isAIInference && (
            <div className="bg-primary/20 rounded-md p-0.5">
              <Image
                src="/images/spark-primary.svg"
                width={24}
                height={24}
                alt="AI Processed Video"
              />
            </div>
          )}
        </div>
        <div className="flex flex-grow cursor-grabbing drag-handle">
          <div className="invisible">Drag</div>
        </div>
        <div className="flex gap-2 w-fit">
          <button
            className="flex gap-2 bg-snow rounded-lg border justify-center h-8 items-center hover:border-primary py-1 px-2 text-sm font-medium"
            onClick={createDefect}
          >
            <Image
              src="/images/camera-primary.svg"
              width={24}
              height={24}
              alt="Capture"
            />
            <label className="cursor-pointer whitespace-nowrap bg-gradient-to-r from-pineGreen to-secondary bg-clip-text text-transparent">
              Capture Defect
            </label>
          </button>
          <IconBox
            action="click"
            icon="window-maximize.svg"
            className="!bg-snow h-8 flex justify-center items-center min-w-8"
            onClick={() => handleNewWindow({ type: "open", id: 2 })}
          />
          <IconBox
            action="close"
            icon="close-black.svg"
            className="!bg-snow h-8 flex justify-center items-center min-w-8"
            onClick={() => handleSideBar(2)}
          />
        </div>
      </div>
    );

    const VideoArea = (
      <div className="w-full h-[calc(100%-3rem)]">
        <VideoPlayer
          ref={videoRef}
          control={true}
          privateUrl={true}
          url={video.videoUrl}
          loadingClassName="w-full h-full"
          className="w-full h-full"
          userId={userId}
          onTimeUpdate={onTimeUpdate}
        />
      </div>
    );

    return (
      <>
        <div className="w-full h-full flex flex-col rounded-lg overflow-hidden">
          {Header}
          {VideoArea}
        </div>

        {newWindow.clicked && newWindow.active.includes(2) && (
          <NewWindow
            id={2}
            title="Inspection Video"
            children={
              <div className="w-full h-full flex flex-col rounded-lg overflow-hidden">
                {Header}
                {VideoArea}
              </div>
            }
          />
        )}
      </>
    );
  }
);

export default VideosWidget;
