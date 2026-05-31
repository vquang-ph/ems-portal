import { useMemo, useState } from "react";
import {
  PROFICIENCY_LEVEL_VALUES,
  type ProficiencyLevel,
  type ProviderSkill,
  type Skill,
} from "@ems-portal/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAddSkillMutation from "../hooks/mutations/useAddSkillMutation";
import useRemoveSkillMutation from "../hooks/mutations/useRemoveSkillMutation";
import useSkillCategoriesQuery from "../hooks/queries/useSkillCategoriesQuery";
import useSkillsQuery from "../hooks/queries/useSkillsQuery";
import { PROVIDER_PROFILE_TEST_IDS } from "../test/testIds";

interface SkillsManagerProps {
  currentSkills: ProviderSkill[];
}

const LEVEL_LABEL: Record<ProficiencyLevel, string> = {
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  expert: "Expert",
};

const SkillsManager = ({ currentSkills }: SkillsManagerProps) => {
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [selectedSkillId, setSelectedSkillId] = useState<number | undefined>();
  const [level, setLevel] = useState<ProficiencyLevel>("mid");
  const [years, setYears] = useState<number>(0);

  const categoriesQuery = useSkillCategoriesQuery();
  const skillsQuery = useSkillsQuery(categoryId);
  const addSkill = useAddSkillMutation();
  const removeSkill = useRemoveSkillMutation();

  const currentSkillIds = useMemo(
    () => new Set(currentSkills.map((s) => s.skillId)),
    [currentSkills],
  );

  const availableSkills: Skill[] = useMemo(
    () => (skillsQuery.data ?? []).filter((s) => !currentSkillIds.has(s.id)),
    [skillsQuery.data, currentSkillIds],
  );

  const skillNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const s of skillsQuery.data ?? []) map.set(s.id, s.name);
    return map;
  }, [skillsQuery.data]);

  const handleAdd = () => {
    if (selectedSkillId === undefined) return;
    addSkill.mutate(
      { skillId: selectedSkillId, level, yearsOfExperience: years },
      {
        onSuccess: () => {
          setSelectedSkillId(undefined);
          setYears(0);
        },
      },
    );
  };

  return (
    <div
      data-testid={PROVIDER_PROFILE_TEST_IDS.skillsManager}
      className="space-y-6"
    >
      <section>
        <h3 className="mb-2 text-sm font-medium">Current skills</h3>
        {currentSkills.length === 0 ? (
          <p className="text-sm text-muted-foreground">No skills added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {currentSkills.map((skill) => (
              <Badge key={skill.skillId} variant="secondary" className="gap-2">
                <span>
                  {skillNameById.get(skill.skillId) ??
                    `Skill #${skill.skillId}`}
                  {" · "}
                  {LEVEL_LABEL[skill.level]}
                  {skill.yearsOfExperience > 0 &&
                    ` · ${skill.yearsOfExperience}y`}
                </span>
                <button
                  type="button"
                  data-testid={`${PROVIDER_PROFILE_TEST_IDS.skillsManagerRemove}-${skill.skillId}`}
                  onClick={() => removeSkill.mutate(skill.skillId)}
                  disabled={removeSkill.isPending}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                  aria-label={`Remove skill ${skill.skillId}`}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-medium">Add a skill</h3>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="skills-category">Category</FieldLabel>
            <Select
              value={categoryId !== undefined ? String(categoryId) : ""}
              onValueChange={(v) => {
                setCategoryId(v ? Number(v) : undefined);
                setSelectedSkillId(undefined);
              }}
            >
              <SelectTrigger
                id="skills-category"
                data-testid={
                  PROVIDER_PROFILE_TEST_IDS.skillsManagerCategorySelect
                }
              >
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                {(categoriesQuery.data ?? []).map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="skills-select">Skill</FieldLabel>
            <Select
              value={
                selectedSkillId !== undefined ? String(selectedSkillId) : ""
              }
              onValueChange={(v) =>
                setSelectedSkillId(v ? Number(v) : undefined)
              }
            >
              <SelectTrigger
                id="skills-select"
                data-testid={PROVIDER_PROFILE_TEST_IDS.skillsManagerSelect}
              >
                <SelectValue placeholder="Choose a skill" />
              </SelectTrigger>
              <SelectContent>
                {availableSkills.map((skill) => (
                  <SelectItem key={skill.id} value={String(skill.id)}>
                    {skill.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="skills-level">Level</FieldLabel>
              <Select
                value={level}
                onValueChange={(v) => setLevel(v as ProficiencyLevel)}
              >
                <SelectTrigger
                  id="skills-level"
                  data-testid={PROVIDER_PROFILE_TEST_IDS.skillsManagerLevel}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROFICIENCY_LEVEL_VALUES.map((l) => (
                    <SelectItem key={l} value={l}>
                      {LEVEL_LABEL[l]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="skills-years">Years</FieldLabel>
              <Input
                id="skills-years"
                data-testid={PROVIDER_PROFILE_TEST_IDS.skillsManagerYears}
                type="number"
                min={0}
                value={years}
                onChange={(e) => setYears(Math.max(0, Number(e.target.value)))}
              />
            </Field>
          </div>
        </FieldGroup>

        <Button
          type="button"
          data-testid={PROVIDER_PROFILE_TEST_IDS.skillsManagerAdd}
          disabled={selectedSkillId === undefined || addSkill.isPending}
          onClick={handleAdd}
        >
          {addSkill.isPending ? "Adding..." : "Add skill"}
        </Button>
      </section>
    </div>
  );
};

export default SkillsManager;
