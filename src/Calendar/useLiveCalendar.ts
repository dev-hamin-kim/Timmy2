import { useEffect, useState } from "react";
import { LiveState } from "@microsoft/live-share";
import { useDynamicDDS } from "@microsoft/live-share-react";
import { CalendarState } from "./types";

const CALENDAR_KEY = "LIVE-CALENDAR";

export const useLiveCalendar = () => {
  const { dds: calendarState } = useDynamicDDS<LiveState<CalendarState>>(
    CALENDAR_KEY,
    LiveState
  );

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!calendarState || isInitialized) return;
      // If initialize is needed, initialize with an empty array
      if (calendarState.initializeState === "needed") {
        await calendarState.initialize([]);
      }

      if (!cancelled) {
        setIsInitialized(true);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [calendarState, isInitialized]);

  return { calendarState, isInitialized };
};
