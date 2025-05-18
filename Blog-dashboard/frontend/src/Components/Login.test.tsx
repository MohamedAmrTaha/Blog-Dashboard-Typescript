import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "./Login";
import '@testing-library/jest-dom';
import { MemoryRouter } from "react-router-dom";

// Mock loginUser API
const mockLoginUser = jest.fn((_data?: any) => Promise.resolve({ user: "test" }));
jest.mock("../../http", () => ({
  loginUser: mockLoginUser,
}));

// Mock useDispatch from react-redux
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch,
}));

// Mock useNavigate from react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
}));

// Mock useMutation from React Query to ensure mutationFn is called and onSuccess triggers
jest.mock("@tanstack/react-query", () => {
  const actual = jest.requireActual("@tanstack/react-query");
  return {
    ...actual,
    useMutation: (options: any) => ({
      mutate: (data: any) => {
        mockLoginUser(data);
        if (options && options.onSuccess) {
          options.onSuccess({ user: "test" }, data, undefined);
        }
      },
      isPending: false,
      error: null as unknown,
    }),
    QueryClientProvider: actual.QueryClientProvider,
    QueryClient: actual.QueryClient,
  };
});

describe("Login component", () => {
  beforeEach(() => {
    mockLoginUser.mockClear();
    mockDispatch.mockClear();
    mockNavigate.mockClear();
  });

  it("renders both Login heading and Login button", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </QueryClientProvider>
    );
    // There should be a heading and a button with text "Login"
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    // Optionally, check that there are exactly two elements with "Login" text
    expect(screen.getAllByText("Login")).toHaveLength(2);

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
  });

  it("shows validation error for invalid email after blur", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "invalid-email" } });
    fireEvent.blur(screen.getByPlaceholderText("Email"));
    expect(await screen.findByText("Enter a valid email")).toBeInTheDocument();
  });

  it("shows validation error for short password after blur", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "123" } });
    fireEvent.blur(screen.getByPlaceholderText("Password"));
    expect(await screen.findByText("Password must be at least 6 charachters")).toBeInTheDocument();
  });

  it("submits the form with valid data, dispatches login, and navigates", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "123456" } });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "123456",
      });
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });
});