"use client";

import { useAppContext } from "@/context/AppContext";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function NewWindow({
  id,
  children,
  title = "New Window",
  width = 600,
  height = 400,
}: {
  id: number,
  children: React.ReactNode;
  onClose?: () => void;
  title?: string;
  width?: number;
  height?: number;
}) {
  const newWindow = useRef<Window | null>(null);
  const containerEl = useRef<HTMLDivElement | null>(null);
  const [isWindowReady, setIsWindowReady] = useState(false);
  const {handleNewWindow} = useAppContext();

  useEffect(() => {
    const features = `width=${width},height=${height},left=200,top=200`;
    newWindow.current = window.open("", title, features);
    containerEl.current = document.createElement("div");

    if (newWindow.current && containerEl.current) {
      const doc = newWindow.current.document;
      doc.body.appendChild(containerEl.current);
      doc.title = title;

      const meta = doc.createElement("meta");
      meta.setAttribute("name", "viewport");
      meta.setAttribute("content", "width=device-width, initial-scale=1.0");
      doc.head.appendChild(meta);

      const currentFavicon = document.querySelector('link[rel*="icon"]');
    if (currentFavicon) {
      const favicon = doc.createElement("link");
      favicon.rel = (currentFavicon as HTMLLinkElement).rel;
      favicon.type = (currentFavicon as HTMLLinkElement).type || "image/x-icon";
      favicon.href = (currentFavicon as HTMLLinkElement).href;
      doc.head.appendChild(favicon);
    }

      // To get all the current styles to new tab.
      const copyStyles = async () => {
        try {
          for (const styleSheet of Array.from(document.styleSheets)) {
            try {
              if (styleSheet.href) {
                const newLink = doc.createElement("link");
                newLink.rel = "stylesheet";
                newLink.href = styleSheet.href;
                await new Promise((resolve, reject) => {
                  newLink.onload = resolve;
                  newLink.onerror = reject;
                  doc.head.appendChild(newLink);
                });
              } else if (styleSheet.cssRules) {
                const newStyle = doc.createElement("style");
                Array.from(styleSheet.cssRules).forEach((rule) => {
                  newStyle.appendChild(doc.createTextNode(rule.cssText));
                });
                doc.head.appendChild(newStyle);
              }
            } catch (e) {
              console.warn("Failed to copy stylesheet:", e);
            }
          }
          setIsWindowReady(true);
        } catch (e) {
          console.error("Failed to copy styles:", e);
        }
      };
      copyStyles();

      const cleanup = () => {
        setIsWindowReady(false);
      };

      const onWindowClose = () => {
        handleNewWindow({ type: "close", id });
      };
      newWindow.current.addEventListener("beforeunload", onWindowClose);
      newWindow.current.addEventListener("beforeunload", cleanup);

      return () => {
        newWindow.current?.removeEventListener("beforeunload", cleanup);
        cleanup();
      };
    }
  }, [height, width, title]);

  useEffect(() => {
    if (isWindowReady && newWindow.current && containerEl.current) {
      const videoElements = containerEl.current.querySelectorAll("video");
      videoElements.forEach((video) => {
        video.load();
      });
    }
  }, [isWindowReady, children]);

  if (!isWindowReady || !containerEl.current) {
    return null;
  }

  return createPortal(
    <div className="w-full h-full bg-white overflow-auto">{children}</div>,
    containerEl.current
  );
}
