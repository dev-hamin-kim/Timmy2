import { useRef, useCallback, useState, useEffect } from "react";

import { InkingTool, IPoint } from "@microsoft/live-share-canvas";
import { useLiveCanvas } from "@microsoft/live-share-react";
import { meeting } from "@microsoft/teams-js";
import { generateUniqueId } from "@microsoft/live-share-canvas/bin/core/internals";

import { PollPage } from "../Poll/PollPage";
import { CalendarPage } from "./CalendarPage";

import {
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  Tooltip,
} from "@fluentui/react-components";

import {
  Pen24Regular,
  CursorClick24Regular,
  Highlight24Regular,
  Eraser24Regular,
  Delete24Regular,
  ZoomIn24Regular,
  ZoomOut24Regular,
  ArrowReset24Regular,
} from "@fluentui/react-icons";

const UNIQUE_KEY = generateUniqueId();

enum Direction {
  Up,
  Down,
  Left,
  Right,
}
// TODO: Adaptive canvas and pen color?
export const LiveCanvasPage = () => {
  const [isPollsShown, setIsPollsShown] = useState(false);
  const [isCalendarShown, setIsCalendarShown] = useState(false);
  const liveCanvasRef = useRef<HTMLDivElement | null>(null);
  const { liveCanvas, inkingManager } = useLiveCanvas(
    UNIQUE_KEY,
    liveCanvasRef
  );

  const [activeTool, setActiveTool] = useState<
    "pen" | "laser" | "highlighter" | "eraser"
  >("pen");

  meeting.getAppContentStageSharingState((error, result) => {
    if (result?.isAppSharing) {
      // close sidepanel upon shared to stage
      // -> cannot be done since there's no such api. (at least according to my knowledge?)
    }
  });

  const setToPen = useCallback(() => {
    if (!inkingManager) return;
    inkingManager.tool = InkingTool.pen;
    setActiveTool("pen");
  }, [inkingManager]);

  const setToLaserPointer = useCallback(() => {
    if (!inkingManager) return;
    inkingManager.tool = InkingTool.laserPointer;
    setActiveTool("laser");
  }, [inkingManager]);

  const setToHighlighter = useCallback(() => {
    if (!inkingManager) return;
    inkingManager.tool = InkingTool.highlighter;
    setActiveTool("highlighter");
  }, [inkingManager]);

  const setToEraser = useCallback(() => {
    if (!inkingManager) return;
    inkingManager.tool = InkingTool.pointEraser;
    setActiveTool("eraser");
  }, [inkingManager]);

  const clearCanvas = useCallback(() => {
    if (inkingManager) {
      inkingManager.clear();
    }
  }, [inkingManager]);

  const shareCursor = useCallback(() => {
    if (!liveCanvas || !inkingManager) return;

    liveCanvas.isCursorShared = true;
  }, [liveCanvas]);

  const zoomIn = useCallback(() => {
    if (inkingManager) {
      inkingManager.scale += 0.1;
    }
  }, [inkingManager]);

  const zoomOut = useCallback(() => {
    if (inkingManager && inkingManager.scale > 0.1) {
      inkingManager.scale -= 0.1;
    }
  }, [inkingManager]);

  const resetZoom = useCallback(() => {
    if (!inkingManager) return;
    inkingManager.scale = 1;
    inkingManager.offset = { x: 0, y: 0 };
  }, [inkingManager]);

  const pan = useCallback(
    (direction: Direction, amount: number) => {
      if (!inkingManager) {
        return;
      }

      const currentOffset = inkingManager.offset;

      const newOffset: IPoint = { ...currentOffset };
      switch (direction) {
        case Direction.Up:
          newOffset.y -= amount;
          break;
        case Direction.Down:
          newOffset.y += amount;
          break;
        case Direction.Left:
          newOffset.x -= amount;
          break;
        case Direction.Right:
          newOffset.x += amount;
          break;
      }

      inkingManager.offset = newOffset;
    },
    [inkingManager]
  );

  const onClickingCalendar = () => {
    setIsCalendarShown(!isCalendarShown);
  };

  useEffect(() => {
    if (!liveCanvasRef.current || !inkingManager) return;

    let isPanning = false;
    let lastX = 0;
    let lastY = 0;

    const el = liveCanvasRef.current;

    const onPointerDown = (e: PointerEvent) => {
      // Middle mouse button OR trackpad two-finger press
      if (e.button === 1) {
        isPanning = true;
        lastX = e.clientX;
        lastY = e.clientY;
        el.setPointerCapture(e.pointerId);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPanning) return;

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;

      inkingManager.offset = {
        x: inkingManager.offset.x + dx,
        y: inkingManager.offset.y + dy,
      };

      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.button === 1) {
        isPanning = false;
        el.releasePointerCapture(e.pointerId);
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
    };
  }, [inkingManager]);

  useEffect(() => {
    if (!liveCanvasRef.current || !inkingManager) return;

    const el = liveCanvasRef.current;

    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;

      e.preventDefault();

      const zoomFactor = e.deltaY < 0 ? 0.1 : -0.1;
      const nextScale = Math.max(0.1, inkingManager.scale + zoomFactor);

      inkingManager.scale = nextScale;
    };

    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [inkingManager]);

  return (
    <>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#fafafa",
            border: "1px solid #ccc",
          }}
          ref={liveCanvasRef}
        />
        {isPollsShown ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "#0420fa",
            }}
          >
            <PollPage />
          </div>
        ) : (
          <></>
        )}
        {isCalendarShown ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "#0c7608ff",
            }}
          >
            <CalendarPage />
          </div>
        ) : (
          <></>
        )}
      </div>

      {/* Bottom-center drawing tools */}
      <Toolbar
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#ffffffcc",
          borderRadius: 12,
          padding: 8,
        }}
      >
        <Tooltip content="Pen" relationship="label">
          <ToolbarButton
            appearance={activeTool === "pen" ? "primary" : "subtle"}
            icon={<Pen24Regular />}
            onClick={setToPen}
          />
        </Tooltip>

        <Tooltip content="Laser Pointer" relationship="label">
          <ToolbarButton
            appearance={activeTool === "laser" ? "primary" : "subtle"}
            icon={<CursorClick24Regular />}
            onClick={setToLaserPointer}
          />
        </Tooltip>

        <Tooltip content="Highlighter" relationship="label">
          <ToolbarButton
            appearance={activeTool === "highlighter" ? "primary" : "subtle"}
            icon={<Highlight24Regular />}
            onClick={setToHighlighter}
          />
        </Tooltip>

        <Tooltip content="Eraser" relationship="label">
          <ToolbarButton
            appearance={activeTool === "eraser" ? "primary" : "subtle"}
            icon={<Eraser24Regular />}
            onClick={setToEraser}
          />
        </Tooltip>

        <ToolbarDivider />

        <Tooltip content="Clear Canvas" relationship="label">
          <ToolbarButton icon={<Delete24Regular />} onClick={clearCanvas} />
        </Tooltip>
      </Toolbar>

      {/* Bottom-right zoom controls */}
      <Toolbar
        vertical
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: "#ffffffcc",
          borderRadius: 12,
          padding: 4,
        }}
      >
        <Tooltip content="Zoom In" relationship="label">
          <ToolbarButton icon={<ZoomIn24Regular />} onClick={zoomIn} />
        </Tooltip>
        <Tooltip content="Reset Zoom" relationship="label">
          <ToolbarButton icon={<ArrowReset24Regular />} onClick={resetZoom} />
        </Tooltip>
        <Tooltip content="Zoom Out" relationship="label">
          <ToolbarButton icon={<ZoomOut24Regular />} onClick={zoomOut} />
        </Tooltip>
      </Toolbar>
    </>
  );
};
