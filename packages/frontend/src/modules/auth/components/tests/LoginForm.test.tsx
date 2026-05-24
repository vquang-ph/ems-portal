import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createStore } from "jotai";
import LoginForm from "../LoginForm";
import useLoginMutation from "../../hooks/mutations/useLoginMutation";
import renderWithStore from "@/test/renderWithStore";
import { AUTH_TEST_IDS } from "../../test/testIds";

vi.mock("../../hooks/mutations/useLoginMutation", () => ({
  default: vi.fn(),
}));
const useLoginMutationMock = vi.mocked(useLoginMutation);

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...rest }: React.PropsWithChildren<{ to?: string }>) => (
    <a {...rest}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
}));

const renderLoginForm = () => renderWithStore(<LoginForm />, createStore());

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email + password fields and submit button", () => {
    useLoginMutationMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useLoginMutation>);

    renderLoginForm();

    expect(screen.getByTestId(AUTH_TEST_IDS.loginEmail)).toBeInTheDocument();
    expect(screen.getByTestId(AUTH_TEST_IDS.loginPassword)).toBeInTheDocument();
    expect(screen.getByTestId(AUTH_TEST_IDS.loginSubmit)).toBeInTheDocument();
  });

  it("does not call mutate when email is invalid", async () => {
    const mutate = vi.fn();
    useLoginMutationMock.mockReturnValue({
      mutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useLoginMutation>);

    renderLoginForm();

    const user = userEvent.setup();
    await user.type(
      screen.getByTestId(AUTH_TEST_IDS.loginEmail),
      "not-an-email",
    );
    await user.type(
      screen.getByTestId(AUTH_TEST_IDS.loginPassword),
      "12345678",
    );
    await user.click(screen.getByTestId(AUTH_TEST_IDS.loginSubmit));

    await waitFor(() => {
      expect(mutate).not.toHaveBeenCalled();
    });
  });

  it("submits with parsed values when fields are valid", async () => {
    const mutate = vi.fn();
    useLoginMutationMock.mockReturnValue({
      mutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useLoginMutation>);

    renderLoginForm();

    const user = userEvent.setup();
    await user.type(
      screen.getByTestId(AUTH_TEST_IDS.loginEmail),
      "client@ems.local",
    );
    await user.type(
      screen.getByTestId(AUTH_TEST_IDS.loginPassword),
      "supersecret",
    );
    await user.click(screen.getByTestId(AUTH_TEST_IDS.loginSubmit));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledTimes(1);
    });
    expect(mutate.mock.calls[0]?.[0]).toEqual({
      email: "client@ems.local",
      password: "supersecret",
    });
  });

  it("disables submit while pending", () => {
    useLoginMutationMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
      error: null,
    } as unknown as ReturnType<typeof useLoginMutation>);

    renderLoginForm();

    expect(screen.getByTestId(AUTH_TEST_IDS.loginSubmit)).toBeDisabled();
  });
});
