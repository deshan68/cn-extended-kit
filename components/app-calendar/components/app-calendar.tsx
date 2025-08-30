"use client";

import React, { useCallback } from "react";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/components/app-calendar/index.css";
import moment from "moment";
import { CalendarEvent } from "@/components/app-calendar/types";
import {
  Components,
  Calendar as BigCalendar,
  momentLocalizer,
} from "react-big-calendar";
import withDragAndDrop, {
  EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import {
  AppCalendarEvent,
  AppCalendarMonthDateHeader,
  AppCalendarShowMore,
  AppCalendarToolbar,
} from "@/components/app-calendar/components";

const DnDCalendar = withDragAndDrop(BigCalendar<CalendarEvent>);

const initialEvents: CalendarEvent[] = [
  // --- Aug 1 ---
  {
    id: "1",
    title: "Kickoff Meeting",
    start: moment("2025-08-01T09:00:00").toDate(),
    end: moment("2025-08-01T10:00:00").toDate(),
    tags: "blue",
    isDraggable: true,
  },
  {
    id: "2",
    title: "Design Sprint",
    start: moment("2025-08-01T11:00:00").toDate(),
    end: moment("2025-08-01T12:30:00").toDate(),
    tags: "green",
    isDraggable: true,
  },
  {
    id: "3",
    title: "Team Lunch",
    start: moment("2025-08-01T13:00:00").toDate(),
    end: moment("2025-08-01T14:00:00").toDate(),
    tags: "yellow",
    isDraggable: false,
  },

  // --- Aug 5 ---
  {
    id: "4",
    title: "Product Review",
    start: moment("2025-08-05T10:00:00").toDate(),
    end: moment("2025-08-05T11:00:00").toDate(),
    tags: "purple",
    isDraggable: true,
  },
  {
    id: "5",
    title: "Client Call",
    start: moment("2025-08-05T14:00:00").toDate(),
    end: moment("2025-08-05T15:00:00").toDate(),
    tags: "red",
    isDraggable: true,
  },

  // --- Aug 10 ---
  {
    id: "6",
    title: "Sprint Planning",
    start: moment("2025-08-10T09:30:00").toDate(),
    end: moment("2025-08-10T11:00:00").toDate(),
    tags: "orange",
    isDraggable: true,
  },
  {
    id: "7",
    title: "Tech Sync",
    start: moment("2025-08-10T13:00:00").toDate(),
    end: moment("2025-08-10T14:00:00").toDate(),
    tags: "blue",
    isDraggable: true,
  },
  {
    id: "8",
    title: "After Hours Debugging",
    start: moment("2025-08-10T20:00:00").toDate(),
    end: moment("2025-08-10T22:00:00").toDate(),
    tags: "red",
    isDraggable: true,
  },

  // --- Aug 15 ---
  {
    id: "9",
    title: "Townhall",
    start: moment("2025-08-15T11:00:00").toDate(),
    end: moment("2025-08-15T12:00:00").toDate(),
    tags: "green",
    isDraggable: true,
  },
  {
    id: "10",
    title: "Lunch & Learn",
    start: moment("2025-08-15T12:30:00").toDate(),
    end: moment("2025-08-15T13:30:00").toDate(),
    tags: "yellow",
    isDraggable: false,
  },

  // --- Aug 20 ---
  {
    id: "11",
    title: "Marketing Sync",
    start: moment("2025-08-20T10:00:00").toDate(),
    end: moment("2025-08-20T11:00:00").toDate(),
    tags: "purple",
    isDraggable: true,
  },
  {
    id: "12",
    title: "Design Workshop",
    start: moment("2025-08-20T14:00:00").toDate(),
    end: moment("2025-08-20T16:00:00").toDate(),
    tags: "orange",
    isDraggable: true,
  },
  {
    id: "13",
    title: "Evening Wrap-up",
    start: moment("2025-08-20T17:30:00").toDate(),
    end: moment("2025-08-20T18:00:00").toDate(),
    tags: "blue",
    isDraggable: true,
  },

  // --- Aug 25 ---
  {
    id: "14",
    title: "Morning Standup",
    start: moment("2025-08-25T09:00:00").toDate(),
    end: moment("2025-08-25T09:30:00").toDate(),
    tags: "blue",
    isDraggable: true,
  },
  {
    id: "15",
    title: "Design Review",
    start: moment("2025-08-25T10:00:00").toDate(),
    end: moment("2025-08-25T11:00:00").toDate(),
    tags: "green",
    isDraggable: true,
  },

  // --- Aug 28 ---
  {
    id: "16",
    title: "Evening Wrap-up",
    start: moment("2025-08-28T17:30:00").toDate(),
    end: moment("2025-08-28T18:00:00").toDate(),
    tags: "blue",
    isDraggable: true,
  },
  {
    id: "17",
    title: "Late Night Debugging",
    start: moment("2025-08-28T21:00:00").toDate(),
    end: moment("2025-08-28T22:30:00").toDate(),
    tags: "red",
    isDraggable: true,
  },

  // --- Aug 30 ---
  {
    id: "18",
    title: "Retrospective",
    start: moment("2025-08-30T09:30:00").toDate(),
    end: moment("2025-08-30T10:30:00").toDate(),
    tags: "purple",
    isDraggable: true,
  },
  {
    id: "19",
    title: "All Hands",
    start: moment("2025-08-30T11:00:00").toDate(),
    end: moment("2025-08-30T12:00:00").toDate(),
    tags: "green",
    isDraggable: true,
  },
  {
    id: "20",
    title: "Team Celebration 🎉",
    start: moment("2025-08-30T18:00:00").toDate(),
    end: moment("2025-08-30T20:00:00").toDate(),
    tags: "yellow",
    isDraggable: true,
  },
];
export function AppCalendar() {
  const [events, setEvents] = React.useState<CalendarEvent[]>(initialEvents);

  const handleToolbarClick = () => {
    console.log("Custom toolbar button clicked 🚀");
  };

  const onEventTimeChange = useCallback(
    (args: EventInteractionArgs<CalendarEvent>) => {
      const event = args.event;
      const newStart =
        typeof args.start === "string" ? new Date(args.start) : args.start;
      const newEnd =
        typeof args.end === "string" ? new Date(args.end) : args.end;
      setEvents((prevEvents) => {
        const updatedEvents = prevEvents.map((e) => {
          if (e.title === event.title) {
            return { ...e, start: newStart, end: newEnd };
          }
          return e;
        });
        return updatedEvents;
      });
    },
    []
  );

  const components: Components<CalendarEvent> = {
    toolbar: (props) => {
      return <AppCalendarToolbar onNewEvent={handleToolbarClick} {...props} />;
    },
    showMore: (props) => <AppCalendarShowMore {...props} />,
    timeGutterWrapper: ({ children }: { children?: React.ReactNode }) => (
      <div className="text-xs text-muted-foreground">{children}</div>
    ),
    header: ({ label }) => (
      <div className="text-xs text-muted-foreground font-medium py-2">
        {label}
      </div>
    ),
    month: {
      dateHeader: (props) => <AppCalendarMonthDateHeader {...props} />,
      event: (props) => <AppCalendarEvent view="month" {...props} />,
    },
    week: {
      event: (props) => <AppCalendarEvent view="week" {...props} />,
    },
    day: {
      event: (props) => <AppCalendarEvent view="day" {...props} />,
    },
  };

  return (
    <DnDCalendar
      className="border rounded-md"
      localizer={momentLocalizer(moment)}
      events={events}
      // step={15}
      // timeslots={4}
      components={components}
      defaultView={"month"}
      views={["day", "week", "month"]}
      // step={15}
      // timeslots={4}
      resizable={true}
      draggableAccessor={(event: CalendarEvent) => !!event.isDraggable}
      onEventDrop={onEventTimeChange}
      onEventResize={onEventTimeChange}
    />
  );
}
