"use client";

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

function IconBase({ size = 24, strokeWidth = 2, children, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.61 2.62a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6.09 6.09l1.46-1.27a2 2 0 0 1 2.11-.45c.84.28 1.72.49 2.62.61A2 2 0 0 1 22 16.92Z" />
    </IconBase>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M19 21a7 7 0 0 0-14 0" />
      <circle cx="12" cy="8" r="4" />
    </IconBase>
  );
}

export function ShoppingBagIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 2l1.5 4" />
      <path d="M18 2l-1.5 4" />
      <path d="M3 7.5h18l-1.2 11A2 2 0 0 1 17.82 20H6.18a2 2 0 0 1-1.98-1.5L3 7.5Z" />
      <path d="M9 11v1" />
      <path d="M15 11v1" />
    </IconBase>
  );
}

export function MessageCircleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7.9 20A9 9 0 1 1 20 12a8.96 8.96 0 0 1-2.64 6.36L20 21l-6.64-2.64A8.96 8.96 0 0 1 7.9 20Z" />
    </IconBase>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </IconBase>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m15 18-6-6 6-6" />
    </IconBase>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m9 18 6-6-6-6" />
    </IconBase>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M3 10h18" />
    </IconBase>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </IconBase>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m6 9 6 6 6-6" />
    </IconBase>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m5 12 4 4L19 6" />
    </IconBase>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </IconBase>
  );
}

export function XIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </IconBase>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </IconBase>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </IconBase>
  );
}

export function DragHandleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="9" cy="7" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="7" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="17" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="17" r="1.1" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function BrandSealIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M50 10c4.8 0 8 3.6 12.4 4.2 4.5.7 8.7-1.4 12.8-.2 4.2 1.2 6.7 5.4 10.2 7.7 3.5 2.4 8.2 3.1 10.8 6.5 2.7 3.5 2.4 8.5 4 12.5 1.6 4.1 5.2 7.1 5.5 11.5.3 4.4-2.7 8.1-3.8 12.2-1.1 4.2-.2 9-2.5 12.6-2.3 3.7-6.9 5.4-10.1 8.3-3.1 2.8-5 7.2-9 8.9-3.9 1.7-8.7.5-12.9 1.4-4.2.9-7.8 4.2-12.2 4.2-4.5 0-8.1-3.3-12.3-4.2-4.3-.9-9 0-12.9-1.7-3.9-1.7-5.7-6.1-8.8-9-3.1-2.8-7.8-4.5-10.1-8.1-2.4-3.7-1.4-8.6-2.5-12.8-1.1-4.1-4.2-7.8-3.9-12.2.3-4.4 3.9-7.4 5.5-11.5 1.6-4 1.3-8.9 4-12.4 2.7-3.5 7.4-4.2 10.9-6.6 3.5-2.4 6-6.5 10.2-7.7 4.1-1.2 8.3 1 12.7.3C42 13.6 45.2 10 50 10Z"
        stroke="currentColor"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M40.5 31.5c0-3.9 3.1-7 7-7h2.5c3.9 0 7 3.1 7 7v12.6l10.6-11.6c2.4-2.6 6.4-2.8 9-.5 2.6 2.4 2.8 6.4.5 9L66 53.2l11 16.1c2 2.9 1.2 6.9-1.7 8.9-2.9 2-6.9 1.2-8.9-1.7L57 62.8v10.7c0 3.9-3.1 7-7 7h-2.5c-3.9 0-7-3.1-7-7v-42Z"
        fill="currentColor"
      />
    </svg>
  );
}
