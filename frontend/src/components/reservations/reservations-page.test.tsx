import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReservationsPage } from "@/components/reservations/reservations-page";
import { deleteReservation } from "@/lib/api/delete-reservation";
import { getReservations } from "@/lib/api/get-reservations";
import type { Reservation } from "@/types/reservation";

jest.mock("@/lib/api/get-reservations", () => ({
  getReservations: jest.fn(),
}));

jest.mock("@/lib/api/delete-reservation", () => ({
  deleteReservation: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockGetReservations = jest.mocked(getReservations);
const mockDeleteReservation = jest.mocked(deleteReservation);

const reservation: Reservation = {
  id: "reservation-1",
  sessionId: "session-1",
  status: "confirmed",
  bookedAt: "2027-01-10T09:00:00+00:00",
  exam: "ETS-EN-001",
  language: "English",
  startsAt: "2027-02-15T14:30:00+00:00",
  location: "Casablanca - Maarif",
};

describe("ReservationsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetReservations.mockResolvedValue([reservation]);
    mockDeleteReservation.mockResolvedValue(undefined);
  });

  it("triggers the cancellation action after confirmation", async () => {
    const user = userEvent.setup();
    render(<ReservationsPage />);

    expect(await screen.findByText(reservation.exam)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Annuler" }));
    await user.click(screen.getByRole("button", { name: "Annuler la réservation" }));

    await waitFor(() => expect(mockDeleteReservation).toHaveBeenCalledWith(reservation.id));
    expect(screen.getByText("Aucune réservation")).toBeInTheDocument();
  });
});
