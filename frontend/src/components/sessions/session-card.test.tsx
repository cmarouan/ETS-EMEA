import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SessionCard } from "@/components/sessions/session-card";
import type { Session } from "@/types/session";

const session: Session = {
  id: "session-1",
  code: "ETS-FR-001",
  language: "French",
  startsAt: "2027-02-15T14:30:00+00:00",
  location: "Rabat - Agdal",
  capacity: 20,
  remainingSeats: 5,
};

describe("SessionCard", () => {
  it("displays the language, date, time, and location", () => {
    const startsAt = new Date(session.startsAt);
    const expectedDate = new Intl.DateTimeFormat("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(startsAt);
    const expectedTime = new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(startsAt);

    render(<SessionCard session={session} onBook={jest.fn()} />);

    expect(screen.getByText(session.language)).toBeInTheDocument();
    expect(screen.getByText(`${expectedDate} · ${expectedTime}`)).toBeInTheDocument();
    expect(screen.getByText(session.location)).toBeInTheDocument();
  });

  it("disables the reservation button when no seats remain", () => {
    render(<SessionCard session={{ ...session, remainingSeats: 0 }} onBook={jest.fn()} />);

    expect(screen.getByRole("button", { name: "Complet" })).toBeDisabled();
  });

  it("triggers the reservation action when reserve is clicked", async () => {
    const user = userEvent.setup();
    const onBook = jest.fn();
    render(<SessionCard session={session} onBook={onBook} />);

    await user.click(screen.getByRole("button", { name: "Réserver" }));

    expect(onBook).toHaveBeenCalledTimes(1);
    expect(onBook).toHaveBeenCalledWith(session);
  });
});
