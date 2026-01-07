import {
  Card,
  CardHeader,
  Text,
  Button,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
} from "@fluentui/react-components";
import {
  MoreVertical20Regular,
  Delete20Regular,
  Clock20Regular,
} from "@fluentui/react-icons";
import { CalendarEvent } from "./types";

interface EventCardProps {
  event: CalendarEvent;
  onDelete: (id: string) => void;
}

export const EventCard = ({ event, onDelete }: EventCardProps) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card
      style={{
        marginBottom: 8,
        borderLeft: `4px solid ${event.color || "#0078D4"}`,
      }}
    >
      <CardHeader
        header={
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Text weight="semibold">{event.title}</Text>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Clock20Regular style={{ fontSize: 14 }} />
              <Text size={200} style={{ color: "var(--colorNeutralForeground2)" }}>
                {formatDate(event.startDate)} • {formatTime(event.startDate)} -{" "}
                {formatTime(event.endDate)}
              </Text>
            </div>
            {event.description && (
              <Text size={200} style={{ color: "var(--colorNeutralForeground3)" }}>
                {event.description}
              </Text>
            )}
          </div>
        }
        action={
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button
                appearance="subtle"
                icon={<MoreVertical20Regular />}
                size="small"
              />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem
                  icon={<Delete20Regular />}
                  onClick={() => onDelete(event.id)}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        }
      />
    </Card>
  );
};
