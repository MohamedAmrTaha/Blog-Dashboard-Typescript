import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Posts from "./Posts";
import '@testing-library/jest-dom';
import { MemoryRouter } from "react-router-dom";

// Mock getPosts API
const mockGetPosts = jest.fn();

// Mock useNavigate from react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
}));

// Mock useQuery from React Query
jest.mock("@tanstack/react-query", () => {
  const actual = jest.requireActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: (options: any) => {
      // Call the queryFn to get the data
      const data = options && options.queryFn ? options.queryFn() : [];
      return {
        data,
        isPending: false,
        isLoading: false,
        error: null as unknown,
      };
    },
    QueryClientProvider: actual.QueryClientProvider,
    QueryClient: actual.QueryClient,
  };
});

jest.mock("../../http", () => ({
  getPosts: (...args: any[]) => mockGetPosts(...args),
}));

describe("Posts component", () => {
  beforeEach(() => {
    mockGetPosts.mockClear();
    mockNavigate.mockClear();
    localStorage.clear();
  });

  it("redirects to / if no token is present", () => {
    localStorage.removeItem("token");
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Posts />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("renders all post fields when data is available", async () => {
    localStorage.setItem("token", "fake-token");
    const posts = [
      {
        id: "1",
        title: "First Post",
        body: "Hello World",
        author: "Alice",
        publishedAt: "2024-05-18T12:00:00.000Z",
      },
      {
        id: "2",
        title: "Second Post",
        body: "Another post",
        author: "Bob",
        publishedAt: "2024-05-19T15:30:00.000Z",
      },
    ];
    mockGetPosts.mockImplementation(() => posts);

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Posts />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      // Heading
      expect(screen.getByText("All Posts")).toBeInTheDocument();

      // First Post
      expect(screen.getByText("First Post")).toBeInTheDocument();
      expect(screen.getByText("Hello World")).toBeInTheDocument();
      expect(screen.getByText("By Alice")).toBeInTheDocument();
      expect(
        screen.getByText(new Date("2024-05-18T12:00:00.000Z").toLocaleDateString())
      ).toBeInTheDocument();

      // Second Post
      expect(screen.getByText("Second Post")).toBeInTheDocument();
      expect(screen.getByText("Another post")).toBeInTheDocument();
      expect(screen.getByText("By Bob")).toBeInTheDocument();
      expect(
        screen.getByText(new Date("2024-05-19T15:30:00.000Z").toLocaleDateString())
      ).toBeInTheDocument();
    });
  });
});