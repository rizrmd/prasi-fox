import { cn } from "@/lib/utils";
import { BadgeAlert } from "lucide-react";
import type { FC, ReactNode } from "react";

export const WarnFull: FC<{
  children: ReactNode;
  size?: number;
  className?: string;
}> = ({ children, size, className }) => {
  return (
    <div
      className={cn(
        "flex-1 flex items-center justify-center flex-col space-y-2 text-center select-none opacity-60",
        className
      )}
    >
      <BadgeAlert size={size || 40} strokeWidth={1.5} />
      <div className="text-sm text-center leading-5">{children}</div>
    </div>
  );
};
