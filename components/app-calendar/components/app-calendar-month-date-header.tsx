import { cn } from "@/lib/utils";
import React, { memo, useMemo } from "react";
import { DateHeaderProps } from "react-big-calendar";

export const AppCalendarMonthDateHeader = memo<DateHeaderProps>(
  ({ date, label, isOffRange }) => {
    const { isToday, isFirstOfMonth, monthLabel } = useMemo(() => {
      const now = new Date();
      const currentDate = new Date(date);

      return {
        isToday:
          currentDate.getDate() === now.getDate() &&
          currentDate.getMonth() === now.getMonth() &&
          currentDate.getFullYear() === now.getFullYear(),
        isFirstOfMonth: currentDate.getDate() === 1,
        monthLabel: currentDate.toLocaleDateString("en-US", { month: "short" }),
      };
    }, [date]);

    const dayClassName = useMemo(
      () =>
        cn(
          "mt-0.5 mx-auto flex aspect-square w-6 items-center justify-center rounded-full p-0.5 text-xs font-medium text-primary",
          isToday && "bg-foreground text-muted",
          isOffRange && "text-muted-foreground"
        ),
      [isToday, isOffRange]
    );

    if (isFirstOfMonth && isOffRange) {
      return (
        <span className="flex items-center justify-center text-xs text-muted-foreground">
          {monthLabel} {label}
        </span>
      );
    }

    return <div className={dayClassName}>{label}</div>;
  }
);

AppCalendarMonthDateHeader.displayName = "AppCalendarMonthDateHeader";
