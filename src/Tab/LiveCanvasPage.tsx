import { useRef, useCallback } from "react";

import { InkingTool, IPoint } from "@microsoft/live-share-canvas";
import { useLiveCanvas } from "@microsoft/live-share-react";
import { meeting } from "@microsoft/teams-js";

const UNIQUE_KEY = "124-fa32g-bs-custom-live-canvas-1249fjadfne";

interface CanvasTool {
  label: string;
  onClick: () => void;
}

enum Direction {
  Up,
  Down,
  Left,
  Right,
}
// TODO: Adaptive canvas and pen color?
export const LiveCanvasPage = () => {
  const liveCanvasRef = useRef<HTMLDivElement | null>(null);
  const { liveCanvas, inkingManager } = useLiveCanvas(
    UNIQUE_KEY,
    liveCanvasRef,
    /* active */ undefined,
    /* tool */ undefined,
    /* lineBrush */ undefined,
    /* offset */ undefined,
    /* scale */ undefined,
    /* referencePoint */ undefined,
    /* isCursorShared */ true
  );

  meeting.getAppContentStageSharingState((error, result) => {
    if (result?.isAppSharing) {
      // close sidepanel upon shared to stage
      // -> cannot be done since there's no such api. (at least according to my knowledge?)
    }
  });

  const setToPen = useCallback(() => {
    if (inkingManager) {
      inkingManager.tool = InkingTool.pen;
    }
  }, [inkingManager]);

  const setToLaserPointer = useCallback(() => {
    if (inkingManager) {
      inkingManager.tool = InkingTool.laserPointer;
    }
  }, [inkingManager]);

  const setToHighlighter = useCallback(() => {
    if (inkingManager) {
      inkingManager.tool = InkingTool.highlighter;
    }
  }, [inkingManager]);

  const setToEraser = useCallback(() => {
    if (inkingManager) {
      inkingManager.tool = InkingTool.pointEraser;
    }
  }, [inkingManager]);

  const clearCanvas = useCallback(() => {
    if (inkingManager) {
      inkingManager.clear();
    }
  }, [inkingManager]);

  const shareCursor = useCallback(() => {
    if (liveCanvas) {
      liveCanvas.isCursorShared = true;
      console.log(`current isCursorShared state: ${liveCanvas.isCursorShared}`);
    }
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

  const toolbarElements: CanvasTool[] = [
    { label: "Pen", onClick: setToPen },
    { label: "Laser Pointer", onClick: setToLaserPointer },
    { label: "Highlighter", onClick: setToHighlighter },
    { label: "Eraser", onClick: setToEraser },
    { label: "Clear", onClick: clearCanvas },
    { label: "Share Cursor", onClick: shareCursor },
    { label: "Zoom in", onClick: zoomIn },
    { label: "Zoom out", onClick: zoomOut },
    { label: "Up", onClick: () => { pan(Direction.Up, 10) } },
    { label: "Down", onClick: () => { pan(Direction.Down, 10) } },
    { label: "Left", onClick: () => { pan(Direction.Left, 10) } },
    { label: "Right", onClick: () => { pan(Direction.Right, 10) } },
  ];

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
      </div>
      <div>
        {toolbarElements.map((element) => {
          return <button onClick={element.onClick}>{element.label}</button>;
        })}
      </div>
    </>
  );
};
