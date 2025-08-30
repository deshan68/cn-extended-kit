import React, { memo } from "react";
import { Event, ShowMoreProps } from "react-big-calendar";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import moment from "moment";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AppCalendarShowMoreProps = ShowMoreProps<Event>;

export const AppCalendarShowMore = memo<AppCalendarShowMoreProps>(
  ({ count, events }) => {
    const EventCard = ({ event }: { event: Event }) => (
      <div className="border rounded-md px-2 py-1 space-y-1 hover:bg-muted/50 transition-colors">
        <div className="flex items-center justify-between">
          <h5 className="font-medium text-sm truncate flex-1">{event.title}</h5>
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-x-1">
          <Clock className="h-3 w-3" />
          <span className="text-xs font-medium">
            {moment(event.start).format("h:mm A")} -{" "}
            {moment(event.end).format("h:mm A")}
          </span>
        </div>
      </div>
    );

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-1 font-normal text-xs text-muted-foreground"
          >
            {count} more
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-w-[200px]" align="center">
          <div className="space-y-1.5">
            {events.length > 0 ? (
              events.map((event, index) => (
                <EventCard key={`${index}-${event.title}`} event={event} />
              ))
            ) : (
              <div className="py-4 text-muted-foreground ">
                <Calendar className="mx-auto mb-2 opacity-50" />
                <p className="text-xs text-center italic">No events found</p>
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);

AppCalendarShowMore.displayName = "AppCalendarShowMore";
