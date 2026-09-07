import { describe, expect, it } from "vitest";
import {
  ASSIGNED_TASK_OPTIONS,
  ATTENDANCE_OPTIONS,
  CommunityServiceResponseSchema,
  CONFLICT_RESOLUTION_OPTIONS,
  CONTRIBUTION_OPTIONS,
  MENTOR_OPTIONS,
  PARTICIPATION_OPTIONS,
} from "../shared/communityService";

const validResponse = {
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

describe("community-service submission validation", () => {
  it("accepts a complete response with multi-select answers", () => {
    expect(CommunityServiceResponseSchema.safeParse(validResponse).success).toBe(true);
  });

  it("rejects an incomplete multi-select response", () => {
    const result = CommunityServiceResponseSchema.safeParse({
      ...validResponse,
      participation: [],
    });

    expect(result.success).toBe(false);
  });

  it("rejects an unconfigured roster placeholder", () => {
    const result = CommunityServiceResponseSchema.safeParse({
      ...validResponse,
      studentName: "Roster pending — replace with this cohort's student names",
    });

    expect(result.success).toBe(false);
  });
});
