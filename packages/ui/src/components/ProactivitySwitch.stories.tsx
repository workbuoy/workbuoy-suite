import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";

import type { Mode, ProactivitySwitchProps } from "./ProactivitySwitch.js";
import { ProactivitySwitch } from "./ProactivitySwitch.js";

type StoryArgs = Omit<ProactivitySwitchProps, "value" | "defaultValue"> & {
  isProactive: boolean;
};

const meta = {
  title: "Components/ProactivitySwitch",
  component: ProactivitySwitch,
  args: {
    size: "md",
    disabled: false,
    isProactive: false,
  },
  argTypes: {
    size: {
      control: { type: "radio" },
      options: ["sm", "md"],
    },
    disabled: {
      control: { type: "boolean" },
    },
    labels: {
      control: "object",
    },
    onChange: {
      action: "changed",
    },
    isProactive: {
      control: { type: "boolean" },
      description: "Toggles the switch between proactive and reactive modes.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "`ProactivitySwitch` exposes `role=\"switch\"`, `aria-checked` and keyboard support for <kbd>Space</kbd>/<kbd>Enter</kbd>. Screen readers announce updates via the built-in polite live region.",
      },
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;

export const Default = {
  render: ({ isProactive, onChange, ...args }: StoryArgs) => {
    const [mode, setMode] = useState<Mode>(isProactive ? "proactive" : "reactive");

    useEffect(() => {
      setMode(isProactive ? "proactive" : "reactive");
    }, [isProactive]);

    return (
      <ProactivitySwitch
        {...args}
        value={mode}
        onChange={(next) => {
          setMode(next);
          onChange?.(next);
        }}
      />
    );
  },
} satisfies StoryObj<StoryArgs>;

export const Controlled = {
  render: ({ isProactive: _isProactive, onChange, ...args }: StoryArgs) => {
    const [mode, setMode] = useState<Mode>("reactive");

    return (
      <div className="flex flex-col items-start gap-4">
        <ProactivitySwitch
          {...args}
          value={mode}
          onChange={(next: Mode) => {
            setMode(next);
            onChange?.(next);
          }}
        />
        <p className="text-sm text-muted-foreground">Current mode: {mode}</p>
      </div>
    );
  },
  args: {
    labels: {
      proactive: "Proactive",
      reactive: "Reactive",
    },
    isProactive: false,
  },
} satisfies StoryObj<StoryArgs>;
