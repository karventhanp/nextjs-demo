import React, { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

interface TerminalViewerProps {
  data: string[];
  style?: React.CSSProperties;
  clear?: boolean;
  progress?: number;
}

const TerminalViewer: React.FC<TerminalViewerProps> = ({
  data,
  style,
  clear,
  progress
}) => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (xtermRef.current && progress && progress !== 0) {
      const width = 40; // total characters in progress bar
      const filled = Math.round((progress / 100) * width);
      const empty = width - filled;

      const bar = `[${"█".repeat(filled)}${" ".repeat(empty)}] ${progress}%`;

      xtermRef.current.write(`\r${bar}`);
    }
  }, [progress]);

  useEffect(() => {
    if (clear && xtermRef.current) xtermRef.current.clear();
  }, [clear]);

  useEffect(() => {
    if (xtermRef.current) {
      data.forEach((item) => {
        xtermRef.current?.writeln(`\x1b[38;2;250;250;250m${item}\x1b[0m`);
      });
      fitAddonRef.current?.fit();
    }
  }, [data]);

  useEffect(() => {
    if (terminalRef.current) {
      const term = new Terminal({
        cursorBlink: true,
        disableStdin: false,
        fontWeight: 800,
        theme: {
          background: "#1C1E21",
          foreground: "#abb2bf",
        },
      });

      const fitAddon = new FitAddon();
      fitAddonRef.current = fitAddon;
      term.loadAddon(fitAddon);

      term.open(terminalRef.current);
      fitAddon.fit();
      term.focus();

      xtermRef.current = term;

      const handleResize = () => {
        fitAddon.fit();
      };
      window.addEventListener("resize", handleResize);

      return () => {
        term.dispose();
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  return (
    <div className="w-full h-full">
      <div ref={terminalRef} style={style}></div>
    </div>
  );
};

export default TerminalViewer;
