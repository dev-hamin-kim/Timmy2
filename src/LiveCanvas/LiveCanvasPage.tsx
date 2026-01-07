import { useRef, useCallback, useState, useEffect } from "react";

import { InkingTool, IPoint } from "@microsoft/live-share-canvas";
import { useLiveCanvas } from "@microsoft/live-share-react";
import { meeting } from "@microsoft/teams-js";
import { generateUniqueId } from "@microsoft/live-share-canvas/bin/core/internals";

import { PollPage } from "../Poll/PollPage";
import { CalendarPage } from "../Tab/CalendarPage";
import { LiveCanvasToolBar } from "./LiveCanvasToolbar";



const UNIQUE_KEY = generateUniqueId();


// TODO: Adaptive canvas and pen color?
export const LiveCanvasPage = () => {
  const [isPollsShown, setIsPollsShown] = useState(false);
  const [isCalendarShown, setIsCalendarShown] = useState(false);
  const liveCanvasRef = useRef<HTMLDivElement | null>(null);
  const { liveCanvas, inkingManager } = useLiveCanvas(
    UNIQUE_KEY,
    liveCanvasRef
  );



  meeting.getAppContentStageSharingState((error, result) => {
    if (result?.isAppSharing) {
      // close sidepanel upon shared to stage
      // -> cannot be done since there's no such api. (at least according to my knowledge?)
    }
  });

  

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
      <LiveCanvasToolBar inkingManager={inkingManager}  />
    </>
  );
};
