import React from "react";
import { EventProps, View } from "react-big-calendar";
import { CalendarEvent } from "@/components/app-calendar/types";
import { cn } from "@/lib/utils";
import { TAG_COLORS } from "@/components/app-calendar/constants";

interface AppCalendarEventProps extends EventProps<CalendarEvent> {
  view: View;
}

const formatTime = (date?: Date): string => {
  return (
    date?.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }) || ""
  );
};

const EventContent: React.FC<{
  title: string;
  time: string;
  layout: "inline" | "stacked" | "day";
}> = ({ title, time, layout }) => {
  if (layout === "inline") {
    return (
      <span className="font-semibold text-xs truncate flex justify-between items-center gap-1">
        <span className="truncate">{title}</span>
        <span className="text-xs font-normal">{time}</span>
      </span>
    );
  }

  if (layout === "stacked") {
    return (
      <>
        <span className="font-semibold text-xs truncate">{title}</span>
        <span className="font-normal text-xs truncate">{time}</span>
      </>
    );
  }

  // day layout
  return (
    <span className="font-semibold text-xs truncate flex gap-x-4 items-center gap-1">
      <span className="truncate">{title}</span>
      <span className="text-xs font-normal">{time}</span>
    </span>
  );
};

const getLayoutForView = (view: View): "inline" | "stacked" | "day" | null => {
  switch (view) {
    case "month":
      return "inline";
    case "week":
      return "stacked";
    case "day":
      return "day";
    default:
      return null;
  }
};

export const AppCalendarEvent = React.memo<AppCalendarEventProps>(
  ({ event, view }) => {
    const layout = getLayoutForView(view);

    if (!layout) return null;

    const time = formatTime(event.start);
    const colorTheme =
      TAG_COLORS[event.tags || "pink"]?.theme || TAG_COLORS.pink.theme;

    return (
      <div
        className={cn(
          "p-1 rounded-sm h-full w-full flex flex-col border",
          colorTheme
        )}
      >
        <EventContent title={event.title} time={time} layout={layout} />
      </div>
    );
  }
);

AppCalendarEvent.displayName = "AppCalendarEvent";
