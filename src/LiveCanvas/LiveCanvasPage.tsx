import { useRef, useState, useEffect } from "react";

import { useLiveCanvas } from "@microsoft/live-share-react";
import { PollPage } from "../Poll/PollPage";
import { CalendarPage } from "../Calendar/CalendarPage";
import { LiveCanvasToolBar } from "./LiveCanvasToolbar";

const SHARED_CANVAS_KEY = "TIMMY_SHARED_CANVAS";

// TODO: Adaptive canvas and pen color?
export const LiveCanvasPage = () => {
  const [isPollsShown, setIsPollsShown] = useState(false);
  const [isCalendarShown, setIsCalendarShown] = useState(false);
  const liveCanvasRef = useRef<HTMLDivElement | null>(null);

  // Enable active inking and cursor sharing. Pass `true` for the `active` arg
  // and the `isCursorShared` arg so the inking manager listens and cursors are shared.
  const { liveCanvas, inkingManager } = useLiveCanvas(
    SHARED_CANVAS_KEY,
    liveCanvasRef,
    true, // active
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    true // isCursorShared
  );

  const togglePolls = () => {
    setIsPollsShown((prev) => !prev);
  };

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
            background: "var(--colorNeutralBackground1)",
            border: "1px solid var(--colorNeutralStroke2)",
          }}
          ref={liveCanvasRef}
        />
        {isPollsShown && (
          <div
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 420,
              height: "calc(100% - 32px)",
              background: "var(--colorNeutralBackground2)",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              overflow: "hidden",
              pointerEvents: "auto",
              zIndex: 10,
            }}
          >
            <PollPage />
          </div>
        )}
        {isCalendarShown && (
          <div
            style={{
              position: "absolute",
              top: 16,
              right: isPollsShown ? 452 : 16,
              width: 420,
              height: "calc(100% - 32px)",
              background: "var(--colorNeutralBackground1)",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              overflow: "hidden",
              pointerEvents: "auto",
              zIndex: 9,
            }}
          >
            <CalendarPage />
          </div>
        )}
      </div>
      <LiveCanvasToolBar
        inkingManager={inkingManager}
        onTogglePolls={togglePolls}
        onToggleCalendar={onClickingCalendar}
      />
    </>
  );
};
