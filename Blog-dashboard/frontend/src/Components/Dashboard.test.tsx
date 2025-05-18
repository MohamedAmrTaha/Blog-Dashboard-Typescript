import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "./Dashboard";
import '@testing-library/jest-dom';
import { MemoryRouter } from "react-router-dom";

// Mock getUserPosts API
const mockGetUserPosts = jest.fn();
jest.mock("../../http", () => ({
  getUserPosts: (...args: any[]) => mockGetUserPosts(...args),
}));

// Mock useNavigate from react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock useQuery from React Query
jest.mock("@tanstack/react-query", () => {
  const actual = jest.requireActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: (options: any) => {
      const data = options && options.queryFn ? options.queryFn() : [];
      return {
        data,
        isPending: false,
        error: null as unknown as Error,
      };
    },
    QueryClientProvider: actual.QueryClientProvider,
    QueryClient: actual.QueryClient,
  };
});

describe("Dashboard component", () => {
  beforeEach(() => {
    mockGetUserPosts.mockClear();
    mockNavigate.mockClear();
    localStorage.clear();
  });

  it("redirects to / if no token is present", () => {
    localStorage.removeItem("token");
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("renders user info and posts when data is available", async () => {
    localStorage.setItem("token", "fake-token");
    localStorage.setItem("user", JSON.stringify({ name: "Alice", email: "alice@example.com" }));
    const posts = [
      {
        id: "1",
        title: "My First Post",
        body: "This is my first blog post.",
        author: "Alice",
        publishedAt: "2024-05-20T10:00:00.000Z",
        authorId: "1",
      },
    ];
    mockGetUserPosts.mockImplementation(() => posts);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Username:")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Email:")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Your Blog Posts:")).toBeInTheDocument();
    expect(screen.getByText("My First Post")).toBeInTheDocument();
    expect(screen.getByText("This is my first blog post.".slice(0, 100) + "...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View Post" })).toBeInTheDocument();

    // Test navigation to post detail
    fireEvent.click(screen.getByRole("button", { name: "View Post" }));
    expect(mockNavigate).toHaveBeenCalledWith("/posts/1");
  });

  it("shows 'No posts found' and 'Create one?' button if no posts", async () => {
    localStorage.setItem("token", "fake-token");
    localStorage.setItem("user", JSON.stringify({ name: "Bob", email: "bob@example.com" }));
    mockGetUserPosts.mockImplementation(() => []);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText("No posts found.")).toBeInTheDocument();
    const createBtn = screen.getByRole("button", { name: "Create one?" });
    expect(createBtn).toBeInTheDocument();

    // Test navigation to create post
    fireEvent.click(createBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/create-post");
  });
});