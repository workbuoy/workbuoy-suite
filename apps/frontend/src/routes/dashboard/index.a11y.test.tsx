import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardRoute from "./index";
import { vi } from "vitest";

describe("Dashboard route accessibility", () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.95);
  });

  afterEach(() => {
    randomSpy.mockRestore();
    vi.useRealTimers();
  });

  const finishLoading = async () => {
    await act(async () => {
      vi.advanceTimersByTime(900);
    });
    await screen.findAllByRole("heading", { level: 3 });
  };

  it("exposes landmarks, headings and focuses the main region", async () => {
    render(<DashboardRoute />);

    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveFocus();

    expect(screen.getByRole("heading", { level: 1, name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /proactivity controls/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /priority overview/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /activity highlights/i })).toBeInTheDocument();

    await finishLoading();
  });

  it("maintains a predictable tab order across tile controls", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DashboardRoute />);

    await finishLoading();

    const firstTile = screen.getByRole("button", { name: /suggested next steps/i });
    const firstAction = screen.getByRole("button", { name: /plan outreach/i });
    const secondAction = screen.getByRole("button", { name: /open planner/i });
    const secondTile = screen.getByRole("button", { name: /momentum boosts/i });

    firstTile.focus();
    expect(firstTile).toHaveFocus();

    await user.tab();
    expect(firstAction).toHaveFocus();

    await user.tab();
    expect(secondAction).toHaveFocus();

    await user.tab();
    expect(secondTile).toHaveFocus();
  });

  it("supports activating tiles via keyboard and pointer input", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DashboardRoute />);

    await finishLoading();

    const tile = screen.getByRole("button", { name: /suggested next steps/i });
    tile.focus();
    expect(tile).toHaveAttribute("aria-pressed", "false");

    await user.keyboard("{Enter}");
    expect(tile).toHaveAttribute("aria-pressed", "true");

    await user.keyboard("{Space}");
    expect(tile).toHaveAttribute("aria-pressed", "false");

    await user.click(tile);
    expect(tile).toHaveAttribute("aria-pressed", "true");
  });

  it("announces proactivity changes via the live status region", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DashboardRoute />);

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/proactive view enabled/i);

    const toggle = screen.getByRole("switch", { name: /dashboard proactivity mode/i });
    await user.click(toggle);
    expect(status).toHaveTextContent(/reactive view enabled/i);

    await user.click(toggle);
    expect(status).toHaveTextContent(/proactive view enabled/i);
  });

  it("marks the priority overview as busy while skeletons render", async () => {
    render(<DashboardRoute />);

    const priorityRegion = screen.getByRole("region", { name: /priority overview/i });
    expect(priorityRegion).toHaveAttribute("aria-busy", "true");
    expect(priorityRegion).toHaveAttribute("aria-describedby", expect.stringContaining("dashboard-priority-loading"));
    expect(screen.getByText(/loading priority overview/i)).toBeInTheDocument();

    await finishLoading();

    expect(priorityRegion).toHaveAttribute("aria-busy", "false");
    expect(priorityRegion).not.toHaveAttribute("aria-describedby");
  });

  it("highlights the current dashboard navigation link", () => {
    render(<DashboardRoute />);
    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute("aria-current", "page");
  });
});
