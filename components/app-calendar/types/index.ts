import { Event } from "react-big-calendar";

export type TagColor = {
  label: string;
  theme: string;
};

export type TagColors = {
  [key in Colors]: TagColor;
};

export type Colors =
  | "pink"
  | "blue"
  | "green"
  | "gray"
  | "red"
  | "yellow"
  | "purple"
  | "orange";

export interface CalendarEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;

  description?: string;
  location?: string;
  tags?: keyof TagColors;
  isEditable?: boolean;
  isDraggable?: boolean;
}
