import {
  Toolbar,
  Tooltip,
  ToolbarButton,
  ToolbarDivider,
} from "@fluentui/react-components";
import { InkingManager, InkingTool } from "@microsoft/live-share-canvas";

import {
  Pen24Regular,
  CursorClick24Regular,
  Highlight24Regular,
  Eraser24Regular,
  Delete24Regular,
  ZoomIn24Regular,
  ZoomOut24Regular,
  ArrowReset24Regular,
  Poll24Regular,
  Calendar24Regular,
} from "@fluentui/react-icons";
import { useCallback, useState } from "react";

interface LiveCanvasToolBarProp {
  inkingManager?: InkingManager;
  onTogglePolls?: () => void;
  onToggleCalendar?: () => void;
}

export const LiveCanvasToolBar = ({
  inkingManager,
  onTogglePolls,
  onToggleCalendar,
}: LiveCanvasToolBarProp) => {
  const [activeTool, setActiveTool] = useState<
    "pen" | "laser" | "highlighter" | "eraser"
  >("pen");
  // calendar visibility is controlled by parent (LiveCanvasPage).
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

  //   const shareCursor = useCallback(() => {
  //     if (!liveCanvas || !inkingManager) return;

  //     liveCanvas.isCursorShared = true;
  //   }, [liveCanvas]);

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


  return (
    <>
      {/* Bottom-center drawing tools */}
      <Toolbar
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          background: "var(--colorNeutralBackground2)",
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
          background: "var(--colorNeutralBackground2)",
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
        <ToolbarDivider />
      </Toolbar>

      {/* Top-right Poll toggle */}
      <Toolbar
        vertical
        style={{
          position: "fixed",
          top: 24,
          right: 24,
          background: "var(--colorNeutralBackground2)",
          borderRadius: 12,
          padding: 4,
          zIndex: 20,
        }}
      >
        <Tooltip content="Polls" relationship="label">
          <ToolbarButton icon={<Poll24Regular />} onClick={onTogglePolls} />
        </Tooltip>
        <Tooltip content="Calendar" relationship="label">
          <ToolbarButton
            icon={<Calendar24Regular />}
            onClick={onToggleCalendar}
          />
        </Tooltip>
      </Toolbar>
    </>
  );
};
