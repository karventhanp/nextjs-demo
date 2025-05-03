import { getValidUrl } from "@/helpers/helper";
import {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import Skeleton from "./Skeleton";
import { convertTimeToSeconds, formatVideoTimeStamp } from "@/utils/utils";
import { VideoPlayerHandle, VideoPlayerProps } from "@/types/common";

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  (
    {
      url,
      userId,
      privateUrl,
      control,
      autoPlay,
      canDownload,
      className,
      loadingClassName,
      seek,
      onTimeUpdate,
    },
    ref
  ) => {
    const [videoUrl, setVideoUrl] = useState<string>();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleSeek = (timeStamp?: string) => {
      let jumpTime = undefined;
      if (timeStamp) {
        jumpTime = timeStamp;
      } else if (seek) {
        jumpTime = seek;
      }
      if (videoRef.current && jumpTime) {
        const seekTime = convertTimeToSeconds(jumpTime);
        if (!isNaN(seekTime)) {
          videoRef.current.currentTime = seekTime;

          if (!videoRef.current.paused) {
            videoRef.current.play().catch((err) => {
              console.error("Error during play:", err);
            });
          }
        }
      }
    };

    useEffect(() => {
      handleSeek();
    }, [seek]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video || !onTimeUpdate) return;

      const handleTimeUpdate = () => {
        onTimeUpdate(formatVideoTimeStamp(video.currentTime));
      };

      video.addEventListener("timeupdate", handleTimeUpdate);

      return () => video.removeEventListener("timeupdate", handleTimeUpdate);
    }, [onTimeUpdate]);

    useEffect(() => {
      setVideoUrl(privateUrl ? getValidUrl(url, userId) : url);
      const video = videoRef.current;
      const onCanPlay = () => handleSeek();

      if (video) {
        video.addEventListener("canplay", onCanPlay);
        return () => video.removeEventListener("canplay", onCanPlay);
      }
    }, [url]);

    useImperativeHandle(ref, () => ({
      captureFrame: () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const timeStamp = formatVideoTimeStamp(video.currentTime);
        const dataUrl = canvas.toDataURL("image/png");
        return {
          image: dataUrl,
          timeStamp,
        };
      },
      jumpToVideoFrame: (timeStamp) => {
        handleSeek(timeStamp);
      },
    }));

    return (
      <div className="w-full h-full">
        {videoUrl ? (
          <>
            <video
              src={videoUrl}
              ref={videoRef}
              className={`${className} h-full w-full`}
              controls={control}
              autoPlay={autoPlay}
              crossOrigin="anonymous"
              controlsList={!canDownload ? "nodownload" : ""}
              onContextMenu={(e) => !canDownload && e.preventDefault()}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            ></video>
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </>
        ) : (
          <div
            className={
              loadingClassName ? loadingClassName : "h-40 w-full rounded-lg"
            }
          >
            <Skeleton type="box" />
          </div>
        )}
      </div>
    );
  }
);

export default VideoPlayer;
