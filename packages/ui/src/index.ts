export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  children: string;
}

export function Button(_props: ButtonProps): string {
  return "";
}

export const APP_TITLE = "Debatr";
