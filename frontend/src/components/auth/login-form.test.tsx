import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/auth/login-form";
import { login } from "@/lib/api/login";

const mockReplace = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    refresh: mockRefresh,
  }),
}));

jest.mock("@/lib/api/login", () => ({
  login: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
  },
}));

const mockLogin = jest.mocked(login);

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.replaceState({}, "", "/login");
  });

  it("renders the email, password, and submit fields", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Se connecter" })).toBeInTheDocument();
  });

  it("prevents submission when required fields are empty", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(mockLogin).not.toHaveBeenCalled();
    expect(await screen.findByText("Saisissez une adresse e-mail valide.")).toBeInTheDocument();
    expect(screen.getByText("Saisissez votre mot de passe.")).toBeInTheDocument();
  });

  it("redirects the user to the correct page after a successful login", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);
    render(<LoginForm />);

    await user.type(screen.getByLabelText("E-mail"), "user@example.com");
    await user.type(screen.getByLabelText("Mot de passe"), "password123!");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/sessions"));
    expect(mockRefresh).toHaveBeenCalled();
  });
});
