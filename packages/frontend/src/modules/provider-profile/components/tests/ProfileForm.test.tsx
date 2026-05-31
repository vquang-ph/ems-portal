import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createStore } from "jotai";
import ProfileForm from "../ProfileForm";
import renderWithStore from "@/test/renderWithStore";
import { PROVIDER_PROFILE_TEST_IDS } from "../../test/testIds";

// Radix's Switch (via @radix-ui/react-use-size) needs ResizeObserver, which
// jsdom doesn't provide. Stub it for this file only.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??=
  ResizeObserverStub as unknown as typeof ResizeObserver;

describe("ProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all expected fields and submit button", () => {
    renderWithStore(<ProfileForm onSubmit={vi.fn()} />, createStore());

    expect(
      screen.getByTestId(PROVIDER_PROFILE_TEST_IDS.profileFormBio),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(PROVIDER_PROFILE_TEST_IDS.profileFormRateMin),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(PROVIDER_PROFILE_TEST_IDS.profileFormRateMax),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(PROVIDER_PROFILE_TEST_IDS.profileFormLatitude),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(PROVIDER_PROFILE_TEST_IDS.profileFormLongitude),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(PROVIDER_PROFILE_TEST_IDS.profileFormAvailable),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(PROVIDER_PROFILE_TEST_IDS.profileFormSubmit),
    ).toBeInTheDocument();
  });

  it("submits parsed values when fields are filled", async () => {
    const onSubmit = vi.fn();
    renderWithStore(<ProfileForm onSubmit={onSubmit} />, createStore());

    const user = userEvent.setup();
    await user.type(
      screen.getByTestId(PROVIDER_PROFILE_TEST_IDS.profileFormBio),
      "Senior network engineer",
    );
    await user.type(
      screen.getByTestId(PROVIDER_PROFILE_TEST_IDS.profileFormRateMin),
      "80",
    );
    await user.type(
      screen.getByTestId(PROVIDER_PROFILE_TEST_IDS.profileFormRateMax),
      "150",
    );
    await user.type(
      screen.getByTestId(PROVIDER_PROFILE_TEST_IDS.profileFormLatitude),
      "52.52",
    );
    await user.type(
      screen.getByTestId(PROVIDER_PROFILE_TEST_IDS.profileFormLongitude),
      "13.405",
    );

    await user.click(
      screen.getByTestId(PROVIDER_PROFILE_TEST_IDS.profileFormSubmit),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const payload = onSubmit.mock.calls[0]?.[0];
    expect(payload).toMatchObject({
      bio: "Senior network engineer",
      hourlyRateMin: 80,
      hourlyRateMax: 150,
      latitude: 52.52,
      longitude: 13.405,
      isAvailable: true,
    });
  });

  it("pre-fills inputs from defaultValues", () => {
    renderWithStore(
      <ProfileForm
        defaultValues={{
          bio: "Existing bio",
          hourlyRateMin: 100,
          hourlyRateMax: 200,
          isAvailable: false,
          latitude: 1,
          longitude: 2,
        }}
        onSubmit={vi.fn()}
      />,
      createStore(),
    );

    expect(
      screen.getByTestId(PROVIDER_PROFILE_TEST_IDS.profileFormBio),
    ).toHaveValue("Existing bio");
    expect(
      screen.getByTestId(PROVIDER_PROFILE_TEST_IDS.profileFormRateMin),
    ).toHaveValue(100);
    expect(
      screen.getByTestId(PROVIDER_PROFILE_TEST_IDS.profileFormRateMax),
    ).toHaveValue(200);
  });

  it("disables the submit button when isSubmitting is true", () => {
    renderWithStore(
      <ProfileForm onSubmit={vi.fn()} isSubmitting />,
      createStore(),
    );

    expect(
      screen.getByTestId(PROVIDER_PROFILE_TEST_IDS.profileFormSubmit),
    ).toBeDisabled();
  });
});
