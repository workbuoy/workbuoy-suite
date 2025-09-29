import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import type { Mode, ProactivitySwitchProps } from "./ProactivitySwitch";
import { ProactivitySwitch } from "./ProactivitySwitch";

const meta: Meta<ProactivitySwitchProps> = {
  title: "Components/ProactivitySwitch",
  component: ProactivitySwitch,
  args: {
    size: "md",
    disabled: false,
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
    value: {
      control: false,
    },
    onChange: {
      action: "changed",
    },
  },
};

export default meta;

type Story = StoryObj<ProactivitySwitchProps>;

export const Default: Story = {
  render: (args) => <ProactivitySwitch {...args} />,
};

export const Controlled: Story = {
  render: (args) => {
    const [mode, setMode] = useState<Mode>("reactive");

    return (
      <div className="flex flex-col items-start gap-4">
        <ProactivitySwitch
          {...args}
          value={mode}
          onChange={(next) => {
            setMode(next);
            args.onChange?.(next);
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
  },
};
