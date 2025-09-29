import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import FlipCard from "./FlipCard";
import type { FlipCardProps } from "./FlipCard";

const meta = {
  title: "Components/FlipCard",
  component: FlipCard,
  args: {
    front: (
      <div
        style={{
          padding: "2rem",
          background: "#f5f8ff",
          borderRadius: "1rem",
        }}
      >
        <h3 style={{ margin: 0 }}>Front</h3>
        <p style={{ margin: 0 }}>Click or press Enter/Space to flip.</p>
      </div>
    ),
    back: (
      <div
        style={{
          padding: "2rem",
          background: "#10131a",
          color: "white",
          borderRadius: "1rem",
        }}
      >
        <h3 style={{ margin: 0 }}>Back</h3>
        <p style={{ margin: 0 }}>Flip me again to return.</p>
      </div>
    ),
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof FlipCard>;

export default meta;

export const Default = {
  render: (args: FlipCardProps) => <FlipCard {...args} />,
} satisfies StoryObj<typeof FlipCard>;

export const Controlled = {
  render: (args: FlipCardProps) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
      <FlipCard
        {...args}
        isFlipped={isFlipped}
        onFlip={() => setIsFlipped((value) => !value)}
      />
    );
  },
} satisfies StoryObj<typeof FlipCard>;
