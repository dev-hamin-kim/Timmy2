export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  createdBy: string;
  createdAt: number;
  color?: string;
};

export type CalendarState = CalendarEvent[];

export type CreateEventResult = {
  action: "createEvent";
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
};
