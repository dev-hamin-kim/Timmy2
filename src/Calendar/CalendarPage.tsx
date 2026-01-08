import { useEffect, useRef, useState } from "react";
import { app } from "@microsoft/teams-js";
import {
  Button,
  Text,
  Spinner,
  Tab,
  TabList,
} from "@fluentui/react-components";
import { Add20Regular, Calendar20Regular } from "@fluentui/react-icons";
import { useLiveCalendar } from "./useLiveCalendar";
import { CalendarEvent } from "./types";
import { CreateEventDialog } from "./CreateEventDialog";
import { EventCard } from "./EventCard";

export const CalendarPage = () => {
  const { calendarState, isInitialized } = useLiveCalendar();
  const userID = useRef<string | undefined>(undefined);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"upcoming" | "all">("all");

  useEffect(() => {
    app.getContext().then((context: app.Context) => {
      userID.current = context.user?.id;
    });
  }, []);

  useEffect(() => {
    if (!calendarState) return;

    const syncFromState = () => {
      setEvents(calendarState.state);
    };

    syncFromState();
    calendarState.on("stateChanged", syncFromState);

    return () => {
      calendarState.off("stateChanged", syncFromState);
    };
  }, [calendarState]);

  useEffect(() => {
    console.log("CalendarPage initialized: ", isInitialized)
    if (!calendarState || !isInitialized) return;

    const existingEvents = calendarState.state;
    console.log("Hydrating calendar events for late joiner:", existingEvents);
    setEvents(existingEvents);
  }, [calendarState, isInitialized]);

  const handleCreateEvent = async (
    eventData: Omit<CalendarEvent, "id" | "createdAt" | "createdBy">
  ) => {
    if (!calendarState || !userID.current) return;

    const newEvent: CalendarEvent = {
      ...eventData,
      id: crypto.randomUUID(),
      createdBy: userID.current,
      createdAt: Date.now(),
    };

    const updatedEvents = [...calendarState.state, newEvent];
    await calendarState.set(updatedEvents);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!calendarState) return;

    const updatedEvents = calendarState.state.filter(
      (event) => event.id !== id
    );
    await calendarState.set(updatedEvents);
  };

  const getFilteredEvents = () => {
    const now = new Date();
    if (viewMode === "upcoming") {
      return events
        .filter((event) => new Date(event.startDate) >= now)
        .sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
    }
    return events.sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  };

  const filteredEvents = getFilteredEvents();

  if (!isInitialized) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Spinner label="Loading calendar..." />
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--colorNeutralStroke2)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar20Regular />
            <Text weight="semibold" style={{ color: "var(--colorNeutralForeground1)"}}>Meeting Calendar</Text>
          </div>
          <Button
            appearance="primary"
            icon={<Add20Regular />}
            onClick={() => setIsDialogOpen(true)}
            size="small"
          >
            New Event
          </Button>
        </div>

        {/* View Mode Tabs */}
        <TabList
          selectedValue={viewMode}
          onTabSelect={(_, data) =>
            setViewMode(data.value as "upcoming" | "all")
          }
          size="small"
        >
          <Tab value="all">All Events</Tab>
        </TabList>
      </div>

      {/* Event List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
        }}
      >
        {filteredEvents.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 8,
            }}
          >
            <Calendar20Regular style={{ fontSize: 48, opacity: 0.3 }} />
            <Text style={{ color: "var(--colorNeutralForeground3)" }}>
              {viewMode === "upcoming"
                ? "No upcoming events"
                : "No events scheduled"}
            </Text>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onDelete={handleDeleteEvent}
            />
          ))
        )}
      </div>

      {/* Create Event Dialog */}
      <CreateEventDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreateEvent={handleCreateEvent}
      />
    </div>
  );
};
