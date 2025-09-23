import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import MorphingInput from "./MorphingInput";

describe("MorphingInput", () => {
  function setup(initial = "") {
    const Wrapper = () => {
      const [value, setValue] = React.useState(initial);
      return (
        <MorphingInput
          value={value}
          onChange={setValue}
          id="morph"
          contacts={[
            { id: "1", name: "Ola Nordmann" },
            { id: "2", name: "Kari Nordmann" },
          ]}
          strings={{ label: "Morph" }}
        />
      );
    };
    return render(<Wrapper />);
  }

  it("shows contact picker when name is entered", () => {
    setup();
    const input = screen.getByLabelText("Morph");
    fireEvent.change(input, { target: { value: "Ola Nordmann" } });
    expect(screen.getByText("Ola Nordmann")).toBeInTheDocument();
  });

  it("shows calculator when arithmetic expression entered", () => {
    setup();
    const input = screen.getByLabelText("Morph");
    fireEvent.change(input, { target: { value: "2+2" } });
    expect(screen.getByText(/Resultat 4/)).toBeInTheDocument();
  });
});
