"use client";

import { ChevronRightIcon, ChevronLeftIcon } from "lucide-react";
import { Button } from "./ui/button";

interface ButtonIconProps {
  direction?: "left" | "right";
  onClick?: () => void;
  className?: string;
}

export default function ButtonIcon({
  direction = "right",
  onClick,
  className = "",
}: ButtonIconProps) {
  const isLeft = direction === "left";

  return (
    <div className="hidden md:block">
      <Button
        onClick={onClick}
        variant="default"
        size="icon"
        className={`shadow-lg size-[55px] rounded-full bg-neutral-800 hover:bg-neutral-700 absolute top-1/2 -translate-y-1/2 z-10 ${
          isLeft ? "left-[-40px]" : "right-[-40px]"
        } ${className}`}
      >
        {isLeft ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </Button>
    </div>
  );
}
