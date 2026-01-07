import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Input,
  Label,
  Textarea,
  Field,
} from "@fluentui/react-components";
import { CalendarEvent } from "./types";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateEvent: (event: Omit<CalendarEvent, "id" | "createdAt" | "createdBy">) => void;
}

export const CreateEventDialog = ({
  open,
  onOpenChange,
  onCreateEvent,
}: CreateEventDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSubmit = () => {
    if (!title || !date || !startTime || !endTime) {
      return;
    }

    const startDate = new Date(`${date}T${startTime}`);
    const endDate = new Date(`${date}T${endTime}`);

    onCreateEvent({
      title,
      description,
      startDate,
      endDate,
      color: getRandomColor(),
    });

    // Reset form
    setTitle("");
    setDescription("");
    setDate("");
    setStartTime("");
    setEndTime("");
    onOpenChange(false);
  };

  const getRandomColor = () => {
    const colors = [
      "#0078D4", // Blue
      "#107C10", // Green
      "#E81123", // Red
      "#FF8C00", // Orange
      "#5C2D91", // Purple
      "#008272", // Teal
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogContent>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Title" required>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter event title"
                />
              </Field>

              <Field label="Description">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter event description (optional)"
                  rows={3}
                />
              </Field>

              <Field label="Date" required>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Field>

              <div style={{ display: "flex", gap: 12 }}>
                <Field label="Start Time" required style={{ flex: 1 }}>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </Field>

                <Field label="End Time" required style={{ flex: 1 }}>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Cancel</Button>
            </DialogTrigger>
            <Button
              appearance="primary"
              onClick={handleSubmit}
              disabled={!title || !date || !startTime || !endTime}
            >
              Create Event
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
