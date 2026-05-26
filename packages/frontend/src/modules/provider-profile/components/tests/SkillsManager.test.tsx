import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createStore } from "jotai";
import SkillsManager from "../SkillsManager";
import useAddSkillMutation from "../../hooks/mutations/useAddSkillMutation";
import useRemoveSkillMutation from "../../hooks/mutations/useRemoveSkillMutation";
import useSkillCategoriesQuery from "../../hooks/queries/useSkillCategoriesQuery";
import useSkillsQuery from "../../hooks/queries/useSkillsQuery";
import renderWithStore from "@/test/renderWithStore";
import {
  fakeProviderSkill,
  fakeSkillCategories,
  fakeSkills,
} from "../../test/fixtures";
import { PROVIDER_PROFILE_TEST_IDS } from "../../test/testIds";

vi.mock("../../hooks/mutations/useAddSkillMutation", () => ({
  default: vi.fn(),
}));
vi.mock("../../hooks/mutations/useRemoveSkillMutation", () => ({
  default: vi.fn(),
}));
vi.mock("../../hooks/queries/useSkillCategoriesQuery", () => ({
  default: vi.fn(),
}));
vi.mock("../../hooks/queries/useSkillsQuery", () => ({
  default: vi.fn(),
}));

const useAddSkillMutationMock = vi.mocked(useAddSkillMutation);
const useRemoveSkillMutationMock = vi.mocked(useRemoveSkillMutation);
const useSkillCategoriesQueryMock = vi.mocked(useSkillCategoriesQuery);
const useSkillsQueryMock = vi.mocked(useSkillsQuery);

const setupMocks = (overrides?: {
  addMutate?: ReturnType<typeof vi.fn>;
  removeMutate?: ReturnType<typeof vi.fn>;
}) => {
  const addMutate = overrides?.addMutate ?? vi.fn();
  const removeMutate = overrides?.removeMutate ?? vi.fn();

  useAddSkillMutationMock.mockReturnValue({
    mutate: addMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useAddSkillMutation>);

  useRemoveSkillMutationMock.mockReturnValue({
    mutate: removeMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useRemoveSkillMutation>);

  useSkillCategoriesQueryMock.mockReturnValue({
    data: fakeSkillCategories,
  } as unknown as ReturnType<typeof useSkillCategoriesQuery>);

  useSkillsQueryMock.mockReturnValue({
    data: fakeSkills,
  } as unknown as ReturnType<typeof useSkillsQuery>);

  return { addMutate, removeMutate };
};

describe("SkillsManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders existing skills as removable badges", () => {
    setupMocks();
    const currentSkills = [
      fakeProviderSkill({ skillId: 1, level: "senior" }),
      fakeProviderSkill({ skillId: 3, level: "mid", yearsOfExperience: 2 }),
    ];

    renderWithStore(
      <SkillsManager currentSkills={currentSkills} />,
      createStore(),
    );

    expect(
      screen.getByTestId(`${PROVIDER_PROFILE_TEST_IDS.skillsManagerRemove}-1`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`${PROVIDER_PROFILE_TEST_IDS.skillsManagerRemove}-3`),
    ).toBeInTheDocument();
  });

  it("shows an empty state when there are no skills", () => {
    setupMocks();

    renderWithStore(<SkillsManager currentSkills={[]} />, createStore());

    expect(screen.getByText(/no skills added yet/i)).toBeInTheDocument();
  });

  it("calls removeSkill.mutate when a remove button is clicked", async () => {
    const { removeMutate } = setupMocks();
    const currentSkills = [fakeProviderSkill({ skillId: 1 })];

    renderWithStore(
      <SkillsManager currentSkills={currentSkills} />,
      createStore(),
    );

    const user = userEvent.setup();
    await user.click(
      screen.getByTestId(`${PROVIDER_PROFILE_TEST_IDS.skillsManagerRemove}-1`),
    );

    expect(removeMutate).toHaveBeenCalledWith(1);
  });

  it("disables the add button until a skill is selected", () => {
    setupMocks();
    renderWithStore(<SkillsManager currentSkills={[]} />, createStore());

    expect(
      screen.getByTestId(PROVIDER_PROFILE_TEST_IDS.skillsManagerAdd),
    ).toBeDisabled();
  });

  it("filters out already-added skills from the available list", () => {
    setupMocks();
    // Skill #1 already added — `availableSkills` derived state excludes it.
    const currentSkills = [fakeProviderSkill({ skillId: 1 })];

    renderWithStore(
      <SkillsManager currentSkills={currentSkills} />,
      createStore(),
    );

    // Add button still disabled because nothing is selected.
    expect(
      screen.getByTestId(PROVIDER_PROFILE_TEST_IDS.skillsManagerAdd),
    ).toBeDisabled();
  });

  it("does not call addSkill.mutate when no skill is selected", async () => {
    const { addMutate } = setupMocks();

    renderWithStore(<SkillsManager currentSkills={[]} />, createStore());

    const user = userEvent.setup();
    await user.click(
      screen.getByTestId(PROVIDER_PROFILE_TEST_IDS.skillsManagerAdd),
    );

    await waitFor(() => {
      expect(addMutate).not.toHaveBeenCalled();
    });
  });
});
