import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SessionsPage } from "@/components/sessions/sessions-page";
import { getSessions } from "@/lib/api/get-sessions";
import type { PaginatedResponse } from "@/types/api";
import type { Session } from "@/types/session";

jest.mock("@/lib/api/get-sessions", () => ({
  getSessions: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockGetSessions = jest.mocked(getSessions);

function session(id: string, code: string): Session {
  return {
    id,
    code,
    language: "English",
    startsAt: "2027-02-15T14:30:00+00:00",
    location: "Rabat - Agdal",
    capacity: 20,
    remainingSeats: 5,
  };
}

function page(data: Session[], currentPage: number): PaginatedResponse<Session> {
  return {
    data,
    page: currentPage,
    limit: 6,
    totalItems: 7,
    totalPages: 2,
  };
}

describe("SessionsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSessions.mockImplementation((currentPage) =>
      Promise.resolve(
        currentPage === 1
          ? page([session("session-1", "ETS-EN-001")], 1)
          : page([session("session-2", "ETS-EN-002")], 2),
      ),
    );
  });

  it("loads and displays the next page of sessions", async () => {
    const user = userEvent.setup();
    render(<SessionsPage />);

    expect(await screen.findByRole("heading", { name: "Session ETS-EN-001" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Page suivante" }));

    await waitFor(() => expect(mockGetSessions).toHaveBeenCalledWith(2, 6));
    expect(await screen.findByRole("heading", { name: "Session ETS-EN-002" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Session ETS-EN-001" })).not.toBeInTheDocument();
    expect(screen.getByText("Page 2 sur 2")).toBeInTheDocument();
  });
});
