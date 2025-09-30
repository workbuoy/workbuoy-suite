import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import FlipCard from "./FlipCard.js";
import type { FlipCardProps } from "./FlipCard.js";

type StoryArgs = Omit<FlipCardProps, "front" | "back"> & {
  frontLabel: string;
  backLabel: string;
};

const cardFaceStyle = {
  padding: "2rem",
  borderRadius: "1rem",
};

const meta = {
  title: "Components/FlipCard",
  component: FlipCard,
  args: {
    frontLabel: "Front",
    backLabel: "Back",
  },
  argTypes: {
    onFlip: { action: "flipped" },
    frontLabel: { control: "text", description: "Label rendered on the front face." },
    backLabel: { control: "text", description: "Label rendered on the back face." },
    isFlipped: { control: { type: "boolean" } },
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Use <kbd>Tab</kbd> to focus the card and press <kbd>Enter</kbd> or <kbd>Space</kbd> to flip. The component exposes `aria-pressed` so screen readers announce the toggled state.",
      },
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;

export const Default = {
  render: ({ frontLabel, backLabel, ...args }: StoryArgs) => (
    <FlipCard
      {...args}
      front={
        <div style={{ ...cardFaceStyle, background: "#f5f8ff" }}>
          <h3 style={{ margin: 0 }}>{frontLabel}</h3>
          <p style={{ margin: 0 }}>Click or press Enter/Space to flip.</p>
        </div>
      }
      back={
        <div style={{ ...cardFaceStyle, background: "#10131a", color: "white" }}>
          <h3 style={{ margin: 0 }}>{backLabel}</h3>
          <p style={{ margin: 0 }}>Flip me again to return.</p>
        </div>
      }
    />
  ),
} satisfies StoryObj<StoryArgs>;

export const Controlled = {
  render: ({ frontLabel, backLabel, ...args }: StoryArgs) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
      <FlipCard
        {...args}
        isFlipped={isFlipped}
        onFlip={() => {
          setIsFlipped((value) => !value);
          args.onFlip?.();
        }}
        front={
          <div style={{ ...cardFaceStyle, background: "#f5f8ff" }}>
            <h3 style={{ margin: 0 }}>{frontLabel}</h3>
            <p style={{ margin: 0 }}>Controlled example.</p>
          </div>
        }
        back={
          <div style={{ ...cardFaceStyle, background: "#10131a", color: "white" }}>
            <h3 style={{ margin: 0 }}>{backLabel}</h3>
            <p style={{ margin: 0 }}>Controlled example.</p>
          </div>
        }
      />
    );
  },
} satisfies StoryObj<StoryArgs>;
