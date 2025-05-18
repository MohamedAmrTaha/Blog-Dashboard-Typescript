import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PostDetails from "./PostDetailes";
import '@testing-library/jest-dom';
import { MemoryRouter, useParams } from "react-router-dom";

// Mock API functions
const mockGetPostById = jest.fn();
const mockDeletePost = jest.fn();
jest.mock("../../http", () => ({
  getPostById: (...args: any[]) => mockGetPostById(...args),
  deletePost: (...args: any[]) => mockDeletePost(...args),
  queryClient: {
    invalidateQueries: jest.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => ({ postId: "1" }),
}));

// Mock useQuery and useMutation from React Query
jest.mock("@tanstack/react-query", () => {
  const actual = jest.requireActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: (options: any) => {
      return {
        data: mockGetPostById(),
        isPending: false,
        error: null as unknown,
      };
    },
    useMutation: (options: any) => ({
      mutate: (data: any) => {
        mockDeletePost(data);
        if (options && options.onSuccess) {
          options.onSuccess();
        }
      },
      isPending: false,
      error: null as unknown,
    }),
    QueryClientProvider: actual.QueryClientProvider,
    QueryClient: actual.QueryClient,
  };
});

describe("PostDetails component", () => {
  beforeEach(() => {
    mockGetPostById.mockClear();
    mockDeletePost.mockClear();
    mockNavigate.mockClear();
    localStorage.clear();
  });

  it("redirects to / if no token is present", () => {
    localStorage.removeItem("token");
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <PostDetails />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("renders post details", async () => {
    localStorage.setItem("token", "fake-token");
    localStorage.setItem("user", JSON.stringify({ id: "author1" }));
    mockGetPostById.mockReturnValue({
      id: "1",
      title: "Test Post",
      body: "This is a test post.",
      author: "Alice",
      publishedAt: "2024-05-20T10:00:00.000Z",
      authorId: "author1",
    });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <PostDetails />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText("Test Post")).toBeInTheDocument();
    expect(screen.getByText("This is a test post.")).toBeInTheDocument();
    expect(screen.getByText(/Author:/)).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText(/Published At:/)).toBeInTheDocument();
    expect(
      screen.getByText(new Date("2024-05-20T10:00:00.000Z").toLocaleDateString())
    ).toBeInTheDocument();
  });

  it("shows delete button for author and handles delete", async () => {
    localStorage.setItem("token", "fake-token");
    localStorage.setItem("user", JSON.stringify({ id: "author1" }));
    mockGetPostById.mockReturnValue({
      id: "1",
      title: "Test Post",
      body: "This is a test post.",
      author: "Alice",
      publishedAt: "2024-05-20T10:00:00.000Z",
      authorId: "author1",
    });

    // Mock window.confirm to always return true
    window.confirm = jest.fn(() => true);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <PostDetails />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const deleteBtn = await screen.findByRole("button", { name: "Delete Post" });
    expect(deleteBtn).toBeInTheDocument();

    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockDeletePost).toHaveBeenCalledWith({ postId: "1", token: "fake-token" });
      expect(mockNavigate).toHaveBeenCalledWith("/posts");
    });
  });
});