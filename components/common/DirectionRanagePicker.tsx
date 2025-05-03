import { useEffect, useRef, useState, useCallback, useMemo } from "react";

interface RoundProps {
  ringWidth: number;
}

const Round: React.FC<RoundProps> = ({ ringWidth }) => {
  const size = ringWidth * 1.3;

  return (
    <div
      className="rounded-full border-[2.8px] border-primary bg-snow"
      style={{
        width: size,
        height: size,
        boxSizing: "border-box",
      }}
    />
  );
};

const CLOCK_POSITIONS = Array.from({ length: 12 }, (_, i) => i + 1);

interface DirectionRangePickerProps {
  start: number;
  end: number;
  onChange?: (key: "start" | "end", value: number) => void;
  ringWidth?: number;
  circleRadius?: number;
  width?: number | string;
  height?: number | string;
}

const DirectionRangePicker: React.FC<DirectionRangePickerProps> = ({
  start,
  end,
  ringWidth,
  circleRadius,
  width,
  height,
  onChange = () => {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const dragRef = useRef<"start" | "end" | null>(null);
  const initialRenderRef = useRef(true);

  // Fixed clock position conversion functions
  const clockPosToDegrees = useCallback((pos: number): number => {
    // Map clock positions 1-12 to degrees (30° intervals)
    // 12 should be at -90° (or 270°), 3 at 0°, 6 at 90°, 9 at 180°
    return ((pos === 12 ? 0 : pos) * 30 - 90 + 360) % 360;
  }, []);

  const degreesToClockPos = useCallback((deg: number): number => {
    // Convert degrees back to clock positions
    // Normalize to 0-360 and adjust so 270° maps to 12
    const normalizedDeg = (deg + 90) % 360;
    const pos = Math.round(normalizedDeg / 30);
    return pos === 0 ? 12 : pos;
  }, []);

  const startDeg = clockPosToDegrees(start);
  const endDeg = clockPosToDegrees(end);

  // Force a re-render when dimensions change to ensure proper positioning
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();

      // Check if dimensions actually changed
      if (
        Math.abs(rect.width - dimensions.width) > 1 ||
        Math.abs(rect.height - dimensions.height) > 1
      ) {
        setDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    // Initial update with delay to ensure proper rendering
    if (initialRenderRef.current) {
      const timer = setTimeout(updateDimensions, 50);
      initialRenderRef.current = false;
      return () => clearTimeout(timer);
    } else {
      updateDimensions();
    }

    // Set up resize observer
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(updateDimensions);
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [dimensions.width, dimensions.height]);

  // Calculate center and radii based on current dimensions
  const center = useMemo(
    () => ({
      x: dimensions.width / 2,
      y: dimensions.height / 2,
    }),
    [dimensions]
  );

  const outerRadius = useMemo(
    () =>
      circleRadius ??
      Math.max(20, Math.min(dimensions.width, dimensions.height) / 2 - 4),
    [circleRadius, dimensions]
  );

  const trackRadius = useMemo(() => outerRadius * 0.8, [outerRadius]);

  const trackWidth = useMemo(
    () => ringWidth ?? Math.max(6, outerRadius * 0.15),
    [ringWidth, outerRadius]
  );

  const innerCircleSize = useMemo(() => outerRadius * 0.6, [outerRadius]);

  // Get angle from mouse/touch position with increased precision
  const getAngleDeg = useCallback(
    (clientX: number, clientY: number): number => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return 0;

      const dx = clientX - rect.left - center.x;
      const dy = clientY - rect.top - center.y;
      return (Math.atan2(dy, dx) * 180) / Math.PI;
    },
    [center]
  );

  // Normalize degrees to 0-360 range
  const normalizeDeg = useCallback((deg: number): number => {
    return ((deg % 360) + 360) % 360;
  }, []);

  // Handle pointer movement
  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragRef.current) return;

      const deg = normalizeDeg(getAngleDeg(clientX, clientY));
      const clockPos = degreesToClockPos(deg);

      onChange(dragRef.current, clockPos);
    },
    [getAngleDeg, normalizeDeg, degreesToClockPos, onChange]
  );

  // Mouse move handler
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    },
    [handlePointerMove]
  );

  // Touch move handler
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!e.touches[0]) return;
      e.preventDefault(); // Prevent scrolling while dragging
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    },
    [handlePointerMove]
  );

  // Stop dragging
  const stopDrag = useCallback(() => {
    if (!dragRef.current) return;

    dragRef.current = null;
    document.body.style.cursor = "";

    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", stopDrag);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", stopDrag);
  }, [handleMouseMove, handleTouchMove]);

  // Generate arc path
  const getArcPath = useCallback(
    (start: number, end: number, radius: number): string => {
      // Convert angles to radians for accurate path calculation
      const startRad = (start * Math.PI) / 180;
      const endRad = (end * Math.PI) / 180;

      // Calculate path coordinates
      const x1 = center.x + radius * Math.cos(startRad);
      const y1 = center.y + radius * Math.sin(startRad);
      const x2 = center.x + radius * Math.cos(endRad);
      const y2 = center.y + radius * Math.sin(endRad);

      // Determine if we need the large arc
      const largeArc = (end - start + 360) % 360 > 180 ? 1 : 0;

      return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
    },
    [center]
  );

  // Get handle position with precise calculations
  const getHandlePosition = useCallback(
    (deg: number) => {
      const rad = (deg * Math.PI) / 180;
      // Use precise calculations for handle positions
      return {
        x: center.x + trackRadius * Math.cos(rad),
        y: center.y + trackRadius * Math.sin(rad),
      };
    },
    [center, trackRadius]
  );

  // Start dragging
  const startDrag = useCallback(
    (handle: "start" | "end", e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      dragRef.current = handle;
      document.body.style.cursor = "grabbing";

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", stopDrag);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", stopDrag);
    },
    [handleMouseMove, handleTouchMove, stopDrag]
  );

  // Handle direct clicks on the circle
  const handleClickOnCircle = useCallback(
    (e: React.MouseEvent) => {
      // Don't process clicks if we were dragging
      if (dragRef.current) return;

      const deg = normalizeDeg(getAngleDeg(e.clientX, e.clientY));
      const clockPos = degreesToClockPos(deg);

      // Find which handle is closer
      const diffToStart = Math.min(
        Math.abs(clockPos - start),
        Math.abs(clockPos - start + 12),
        Math.abs(clockPos - start - 12)
      );

      const diffToEnd = Math.min(
        Math.abs(clockPos - end),
        Math.abs(clockPos - end + 12),
        Math.abs(clockPos - end - 12)
      );

      diffToStart <= diffToEnd
        ? onChange("start", clockPos)
        : onChange("end", clockPos);
    },
    [normalizeDeg, getAngleDeg, degreesToClockPos, start, end, onChange]
  );

  const arcPath = useMemo(
    () => getArcPath(startDeg, endDeg, trackRadius),
    [getArcPath, startDeg, endDeg, trackRadius]
  );

  // Calculate handle positions using radians for more precise positioning
  const startHandlePos = useMemo(
    () => getHandlePosition(startDeg),
    [getHandlePosition, startDeg]
  );

  const endHandlePos = useMemo(
    () => getHandlePosition(endDeg),
    [getHandlePosition, endDeg]
  );

  // Check if we should render the component contents
  const shouldRender = dimensions.width > 0 && dimensions.height > 0;

  return (
    <div
      className="w-full h-full"
      style={{
        width: width || "100%",
        height: height || "100%",
      }}
    >
      <div
        ref={containerRef}
        className="relative rounded-full w-full h-full overflow-visible"
        onClick={handleClickOnCircle}
        style={{ touchAction: "none" }}
      >
        {shouldRender && (
          <>
            <svg className="absolute top-0 left-0 w-full h-full">
              <circle
                cx={center.x}
                cy={center.y}
                r={trackRadius}
                fill="none"
                className="stroke-lightGray"
                strokeWidth={trackWidth}
              />
            </svg>

            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <path
                d={arcPath}
                fill="none"
                className="stroke-paleBlue"
                strokeWidth={trackWidth}
                strokeLinecap="butt"
              />
            </svg>

            {CLOCK_POSITIONS.map((pos) => {
              const angle = (clockPosToDegrees(pos) * Math.PI) / 180;
              const rotateDeg = angle * (180 / Math.PI);
              const x = center.x + trackRadius * Math.cos(angle);
              const y = center.y + trackRadius * Math.sin(angle);
              return (
                <div
                  key={pos}
                  className="absolute w-[3px] h-[1px] bg-regentGrey rounded-lg"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    transform: `translate(-50%, -50%) rotate(${rotateDeg}deg) `,
                  }}
                />
              );
            })}

            <div
              className="absolute z-10 transition-all duration-150 ease-out"
              style={{
                left: `${startHandlePos.x}px`,
                top: `${startHandlePos.y}px`,
                transform: `translate(-50%, -50%)`,
                cursor: dragRef.current === "start" ? "grabbing" : "grab",
                // Fixed positioning to prevent edge misalignments
                position: "absolute",
              }}
              onMouseDown={(e) => startDrag("start", e)}
              onTouchStart={(e) => startDrag("start", e)}
            >
              <Round ringWidth={trackWidth} />
            </div>

            <div
              className="absolute z-10 transition-all duration-150 ease-out"
              style={{
                left: `${endHandlePos.x}px`,
                top: `${endHandlePos.y}px`,
                transform: `translate(-50%, -50%)`,
                cursor: dragRef.current === "end" ? "grabbing" : "grab",
                // Fixed positioning to prevent edge misalignments
                position: "absolute",
              }}
              onMouseDown={(e) => startDrag("end", e)}
              onTouchStart={(e) => startDrag("end", e)}
            >
              <Round ringWidth={trackWidth} />
            </div>

            <div
              className="absolute rounded-full bg-snow"
              style={{
                width: `${innerCircleSize}px`,
                height: `${innerCircleSize}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            ></div>
          </>
        )}
      </div>
    </div>
  );
};

export default DirectionRangePicker;
