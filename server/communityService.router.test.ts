import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createCommunityServiceSubmission: vi.fn(),
}));

vi.mock("./db", () => ({
  createCommunityServiceSubmission: mocks.createCommunityServiceSubmission,
}));

import { appRouter } from "./routers";
import {
  ASSIGNED_TASK_OPTIONS,
  ATTENDANCE_OPTIONS,
  CONFLICT_RESOLUTION_OPTIONS,
  CONTRIBUTION_OPTIONS,
  MENTOR_OPTIONS,
  PARTICIPATION_OPTIONS,
} from "../shared/communityService";

const response = {
  studentName: "Adaora Okeke",
  capstoneProject: "Community Health Access",
  serviceDate: "2026-08-01",
  attendance: ATTENDANCE_OPTIONS[2],
  participation: [PARTICIPATION_OPTIONS[0], PARTICIPATION_OPTIONS[7]],
  contributions: [CONTRIBUTION_OPTIONS[3]],
  completedAssignedTask: "yes" as const,
  mentorRating: MENTOR_OPTIONS[0],
  improvementFeedback: "More time for cross-group planning would improve coordination.",
  conflictResolution: CONFLICT_RESOLUTION_OPTIONS[1],
  assignedTasks: [ASSIGNED_TASK_OPTIONS[1], ASSIGNED_TASK_OPTIONS[5]],
};

describe("communityService.submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createCommunityServiceSubmission.mockResolvedValue(42);
  });

  it("persists the validated response and returns a submission reference", async () => {
    const caller = appRouter.createCaller({} as never);
    const result = await caller.communityService.submit(response);

    expect(mocks.createCommunityServiceSubmission).toHaveBeenCalledWith(response);
    expect(result.submissionId).toBe(42);
    expect(new Date(result.submittedAt).toString()).not.toBe("Invalid Date");
  });
});
