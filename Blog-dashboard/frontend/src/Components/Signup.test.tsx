import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Signup from "./Signup";
import '@testing-library/jest-dom';
import { MemoryRouter } from "react-router-dom";

// Mock signupUser API
const mockSignupUser = jest.fn((_data?: any) => Promise.resolve({}));
jest.mock("../../http", () => ({
  signupUser: mockSignupUser,
}));

// Mock useNavigate from react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
}));

// Mock useMutation from React Query to ensure mutationFn is called
jest.mock("@tanstack/react-query", () => {
  const actual = jest.requireActual("@tanstack/react-query");
  return {
    ...actual,
    useMutation: (options: any) => ({
      mutate: (data: any) => {
        mockSignupUser(data);
        if (options && options.onSuccess) {
          options.onSuccess({}, data, undefined);
        }
      },
      isPending: false,
      error: null as unknown,
    }),
    QueryClientProvider: actual.QueryClientProvider,
    QueryClient: actual.QueryClient,
  };
});

describe("Signup component", () => {
  beforeEach(() => {
    mockSignupUser.mockClear();
    mockNavigate.mockClear();
  });

  it("renders all form elements", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
    expect(screen.getByText("SignUp")).toBeInTheDocument();
  });

  it("shows validation error for empty name after blur", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      </QueryClientProvider>
    );

    fireEvent.blur(screen.getByPlaceholderText("Name"));
    expect(await screen.findByText("Enter your name")).toBeInTheDocument();
  });

  it("shows validation error for invalid email after blur", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Signup />
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
          <Signup />
        </MemoryRouter>
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "123" } });
    fireEvent.blur(screen.getByPlaceholderText("Password"));
    expect(await screen.findByText("Password must be at least 6 charachters")).toBeInTheDocument();
  });

  it("submits the form with valid data and navigates", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "Test User" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "123456" } });

    fireEvent.click(screen.getByText("SignUp"));

    await waitFor(() => {
      expect(mockSignupUser).toHaveBeenCalledWith({
        name: "Test User",
        email: "test@example.com",
        password: "123456",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});