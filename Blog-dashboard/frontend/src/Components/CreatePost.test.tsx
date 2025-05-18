import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CreatePost from "./CreatePost";

// Mock useNavigate from react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock useMutation from React Query
const mockMutate = jest.fn();
jest.mock("@tanstack/react-query", () => {
  const actual = jest.requireActual("@tanstack/react-query");
  return {
    ...actual,
    useMutation: (): {
      mutate: typeof mockMutate;
      isPending: boolean;
      error: unknown;
    } => ({
      mutate: mockMutate,
      isPending: false,
      error: null as unknown,
    }),
    QueryClientProvider: actual.QueryClientProvider,
    QueryClient: actual.QueryClient,
  };
});

describe("CreatePost component", () => {
  beforeEach(() => {
    // Mock localStorage for token
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === "token") return "fake-token";
      return null;
    });
    mockMutate.mockClear();
    mockNavigate.mockClear();
  });

  it("renders the form and submits", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CreatePost />
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByPlaceholderText("Title"), { target: { value: "My Post" } });
    fireEvent.change(screen.getByPlaceholderText("Body"), { target: { value: "Post body" } });

    // Submit the form using fireEvent.submit on the form element
    fireEvent.submit(screen.getByText("Save Post").closest("form")!);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        postData: { title: "My Post", body: "Post body" },
        token: "fake-token",
      });
    });
  });
});