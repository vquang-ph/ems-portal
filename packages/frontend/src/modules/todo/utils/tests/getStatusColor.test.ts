import { describe, it, expect } from "vitest";
import { TodoStatus } from "@ems-portal/types";
import getStatusColor from "../getStatusColor";

describe("getStatusColor", () => {
  it("returns bg-slate-500 for todo", () => {
    expect(getStatusColor(TodoStatus.Todo)).toBe("bg-slate-500");
  });

  it("returns bg-amber-500 for pending", () => {
    expect(getStatusColor(TodoStatus.Pending)).toBe("bg-amber-500");
  });

  it("returns bg-blue-500 for in-progress", () => {
    expect(getStatusColor(TodoStatus.InProgress)).toBe("bg-blue-500");
  });

  it("returns bg-green-500 for completed", () => {
    expect(getStatusColor(TodoStatus.Completed)).toBe("bg-green-500");
  });

  it("returns bg-gray-500 for unknown status (default case)", () => {
    // force the default branch at runtime
    expect(getStatusColor("unknown-status" as TodoStatus)).toBe("bg-gray-500");
  });
});
