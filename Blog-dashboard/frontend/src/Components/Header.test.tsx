import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import Header from "./Header";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";

const mockStore = configureStore([]);

describe("Header component", () => {
  it("shows dashboard links and logout when token exists", () => {
    const store = mockStore({
      auth: { token: "fake-token" }
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Posts")).toBeInTheDocument();
    expect(screen.getByText("New Post")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.queryByText("Signup")).not.toBeInTheDocument();
  });

  it("shows only signup when token does not exist", () => {
    const store = mockStore({
      auth: { token: null }
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Signup")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
    expect(screen.queryByText("Posts")).not.toBeInTheDocument();
    expect(screen.queryByText("New Post")).not.toBeInTheDocument();
  });

  it("calls dispatch(logout) when logout is clicked", () => {
    const store = mockStore({
      auth: { token: "fake-token" }
    });
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.click(screen.getByText("Logout"));
    expect(store.dispatch).toHaveBeenCalled();
  });
});