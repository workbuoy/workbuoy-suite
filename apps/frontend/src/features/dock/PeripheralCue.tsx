import React from "react";

export type PeripheralStatus = "ok" | "warn" | "error" | "thinking";
export type PeripheralCuePlacement = "right-edge" | "full-right";

export type PeripheralCueProps = {
  status?: PeripheralStatus;
  placement?: PeripheralCuePlacement;
  active?: boolean;
};

export default function PeripheralCue({
  status = "ok",
  placement = "right-edge",
  active = true,
}: PeripheralCueProps) {
  if (!active) {
    return null;
  }
  return (
    <span
      className={`wb-peripheral wb-peripheral--${placement} wb-peripheral--${status}`}
      aria-hidden="true"
    />
  );
}
