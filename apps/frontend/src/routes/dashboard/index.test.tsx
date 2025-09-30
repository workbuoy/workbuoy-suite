import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardRoute from "./index";
import { vi } from "vitest";

describe("Dashboard route", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the main landmark and headings", async () => {
    render(<DashboardRoute />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /priority overview/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /activity highlights/i })).toBeInTheDocument();

    await act(async () => {
      vi.runAllTimers();
    });

    const tileHeadings = await screen.findAllByRole("heading", { level: 3 });
    expect(tileHeadings[0]).toHaveTextContent(/suggested next steps/i);
  });

  it("supports tab navigation between tile controls", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DashboardRoute />);

    await act(async () => {
      vi.runAllTimers();
    });

    const firstGroup = screen.getByRole("group", { name: /suggested next steps actions/i });
    const firstButtons = within(firstGroup).getAllByRole("button");
    firstButtons[0].focus();
    expect(firstButtons[0]).toHaveFocus();

    await user.tab();
    expect(firstButtons[1]).toHaveFocus();

    await user.tab();
    const secondGroup = screen.getByRole("group", { name: /momentum boosts actions/i });
    const secondButtons = within(secondGroup).getAllByRole("button");
    expect(secondButtons[0]).toHaveFocus();
  });

  it("toggles content with the proactivity switch", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DashboardRoute />);

    await act(async () => {
      vi.runAllTimers();
    });

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings[0]).toHaveTextContent(/suggested next steps/i);

    const status = screen.getByTestId("dashboard-status");
    expect(status).toHaveTextContent(/proactive view enabled/i);

    const toggle = screen.getByRole("switch", { name: /dashboard proactivity mode/i });
    await user.click(toggle);

    const reorderedHeadings = screen.getAllByRole("heading", { level: 3 });
    expect(reorderedHeadings[0]).toHaveTextContent(/customer escalations/i);
    expect(status).toHaveTextContent(/reactive view enabled/i);
  });

  it("updates aria-busy once the skeleton finishes loading", async () => {
    render(<DashboardRoute />);
    const section = screen.getByRole("region", { name: /priority overview/i });
    expect(section).toHaveAttribute("aria-busy", "true");

    await act(async () => {
      vi.advanceTimersByTime(900);
    });

    await screen.findAllByRole("heading", { level: 3 });
    expect(section).toHaveAttribute("aria-busy", "false");
  });
});
