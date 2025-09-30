import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import DashboardRoute from "./index";

const advanceLoading = async () => {
  await act(async () => {
    vi.advanceTimersByTime(900);
  });
};

describe("Dashboard state views", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the empty state when no tiles are returned", async () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValueOnce(0.1);

    try {
      render(<DashboardRoute />);

      await advanceLoading();

      const priorityRegion = screen.getByRole("region", { name: /priority overview/i });
      expect(priorityRegion).toHaveAttribute("aria-busy", "false");

      const emptyStatus = within(priorityRegion).getByRole("status");
      expect(emptyStatus).toHaveTextContent(/ingen paneler ennå/i);

      const addPanels = within(priorityRegion).getByRole("button", { name: /legg til paneler/i });
      addPanels.focus();
      expect(addPanels).toHaveFocus();

      expect(screen.getByTestId("dash-live")).toHaveTextContent(/tomt dashboard/i);
    } finally {
      randomSpy.mockRestore();
    }
  });

  it("announces errors and supports retry via keyboard", async () => {
    const randomSpy = vi
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.3)
      .mockReturnValueOnce(0.3)
      .mockReturnValueOnce(0.95);

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    try {
      render(<DashboardRoute />);

      await advanceLoading();

      const priorityRegion = screen.getByRole("region", { name: /priority overview/i });
      expect(priorityRegion).toHaveAttribute("aria-busy", "false");

      const errorStatus = within(priorityRegion).getByRole("status");
      expect(errorStatus).toHaveTextContent(/kunne ikke laste panelene/i);
      expect(screen.getByTestId("dash-live")).toHaveTextContent(/feil ved lasting/i);

      const retry = within(priorityRegion).getByRole("button", { name: /prøv igjen/i });
      retry.focus();
      expect(retry).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(priorityRegion).toHaveAttribute("aria-busy", "true");

      await advanceLoading();

      const errorStatusAgain = within(priorityRegion).getByRole("status");
      expect(errorStatusAgain).toHaveTextContent(/kunne ikke laste panelene/i);
      expect(retry).toHaveFocus();

      await user.keyboard("{Space}");
      expect(priorityRegion).toHaveAttribute("aria-busy", "true");

      await advanceLoading();

      expect(priorityRegion).toHaveAttribute("aria-busy", "false");
      expect(priorityRegion).not.toHaveAttribute("aria-describedby");
      expect(within(priorityRegion).queryByRole("status")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /suggested next steps/i })).toBeInTheDocument();
      expect(screen.getByTestId("dash-live")).toHaveTextContent(/alle dashboard-paneler klare/i);
    } finally {
      randomSpy.mockRestore();
    }
  });

  it("renders the partial state with live updates", async () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValueOnce(0.55);

    try {
      render(<DashboardRoute />);

      await advanceLoading();

      const priorityRegion = screen.getByRole("region", { name: /priority overview/i });
      expect(priorityRegion).toHaveAttribute("aria-busy", "false");
      expect(priorityRegion).toHaveAttribute("aria-describedby", expect.stringContaining("dashboard-priority-partial"));

      expect(screen.getByText(/3 av 4 paneler klare/i)).toBeInTheDocument();
      expect(screen.getByTestId("dash-live")).toHaveTextContent(/3 av 4 paneler klare/i);

      const tiles = screen.getAllByRole("article");
      expect(tiles).toHaveLength(3);
    } finally {
      randomSpy.mockRestore();
    }
  });

  it("renders the ready state when all tiles load", async () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValueOnce(0.95);

    try {
      render(<DashboardRoute />);

      await advanceLoading();

      const priorityRegion = screen.getByRole("region", { name: /priority overview/i });
      expect(priorityRegion).toHaveAttribute("aria-busy", "false");
      expect(priorityRegion).not.toHaveAttribute("aria-describedby");

      const tiles = screen.getAllByRole("article");
      expect(tiles).toHaveLength(4);
      expect(screen.getByTestId("dash-live")).toHaveTextContent(/alle dashboard-paneler klare/i);
    } finally {
      randomSpy.mockRestore();
    }
  });
});
