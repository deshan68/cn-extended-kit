import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import React, { memo, useCallback, useMemo } from "react";
import { ToolbarProps, View } from "react-big-calendar";
import moment from "moment";
import { CalendarEvent } from "../types";

// Utility function for string capitalization
const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

// Props interface with better naming and documentation
interface AppCalendarToolbarProps extends ToolbarProps<CalendarEvent, object> {
  /** Handler for creating new events */
  onNewEvent?: () => void;
}

/**
 * Custom calendar toolbar component with navigation, view switching, and event creation
 */
export const AppCalendarToolbar = memo<AppCalendarToolbarProps>(
  ({ date, view, views, onNavigate, onView, onNewEvent }) => {
    const dateInfo = useMemo(
      () => ({
        month: moment(date).format("MMM").toUpperCase(),
        day: moment(date).format("D"),
        monthYear: moment(date).format("MMMM YYYY"),
        weekNumber: Math.ceil(moment(date).date() / 7),
        dayName: moment(date).format("dddd"),
      }),
      [date]
    );

    const handlePrevious = useCallback(() => onNavigate("PREV"), [onNavigate]);
    const handleNext = useCallback(() => onNavigate("NEXT"), [onNavigate]);
    const handleToday = useCallback(() => onNavigate("TODAY"), [onNavigate]);

    const handleViewChange = useCallback(
      (newView: View) => {
        onView(newView);
      },
      [onView]
    );

    const viewOptions = useMemo(
      () =>
        (views as View[]).map((viewName) => ({
          key: viewName,
          label: `${capitalize(viewName)} View`,
          value: viewName,
        })),
      [views]
    );

    const currentViewLabel = useMemo(() => `${capitalize(view)} View`, [view]);

    return (
      <div className="flex items-start justify-between p-4">
        {/* Date Display Section */}
        <div className="flex gap-2">
          {/* Calendar Icon */}
          <div className="flex h-16 w-16 flex-col items-center justify-center overflow-hidden rounded-md border">
            <span className="flex h-1/2 w-full items-center justify-center bg-accent py-0.5 text-xs font-semibold">
              {dateInfo.month}
            </span>
            <span className="flex items-center justify-center text-lg font-bold">
              {dateInfo.day}
            </span>
          </div>

          {/* Date Information */}
          <div className="p-1">
            <div className="leading-tight">
              <span className="text-sm font-semibold">
                {dateInfo.monthYear}
              </span>{" "}
              <span className="rounded-sm border bg-muted px-1 py-0.5 text-xs">
                Week {dateInfo.weekNumber}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {dateInfo.dayName}
            </span>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex h-10 space-x-4">
          {/* Navigation Controls */}
          <div className="flex items-center space-x-0.5">
            <Button
              size="icon"
              variant="outline"
              className="h-full"
              onClick={handlePrevious}
              aria-label="Previous period"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-full"
              onClick={handleToday}
            >
              Today
            </Button>

            <Button
              size="icon"
              variant="outline"
              className="h-full"
              onClick={handleNext}
              aria-label="Next period"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* View Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-full min-w-[130px] justify-between"
              >
                {currentViewLabel}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[130px]" align="start">
              {viewOptions.map(({ key, label, value }) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => handleViewChange(value)}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* New Event Button */}
          {onNewEvent && (
            <Button
              size="sm"
              className="h-full"
              onClick={onNewEvent}
              aria-label="Create new event"
            >
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          )}
        </div>
      </div>
    );
  }
);

AppCalendarToolbar.displayName = "AppCalendarToolbar";
