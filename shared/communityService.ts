import { z } from "zod";

export const ATTENDANCE_OPTIONS = [
  "0 to 50% of group meetings",
  "50% to 80% of group meetings",
  "80% to 100% of group meetings",
] as const;

export const PARTICIPATION_OPTIONS = [
  "Online seminar",
  "Town Hall",
  "Debates",
  "Interviews",
  "Trainings",
  "Discussions",
  "Podcasts",
  "Physical group meetings",
  "Site visits",
  "Physical town halls",
  "Physical seminars",
  "Physical trainings",
  "Hosted events",
] as const;

export const CONTRIBUTION_OPTIONS = [
  "Personally contributed financially",
  "Enabled donation by a third party",
  "Provided the use of your property, car, staff, or other asset to the project",
  "Contributed via personal network",
] as const;

export const MENTOR_OPTIONS = [
  "The project mentor performed well",
  "The project mentor was not efficient",
] as const;

export const CONFLICT_RESOLUTION_OPTIONS = [
  "I was not involved in any conflict",
  "I aided with conflict resolution",
  "I was in a conflict, but found a way to resolve the conflict",
  "I was in a conflict that did not get resolved",
] as const;

export const ASSIGNED_TASK_OPTIONS = [
  "Writing final report",
  "Project management",
  "Team lead",
  "Deputy team lead",
  "Functioned in accounting capacity",
  "I.T. related",
  "Research",
  "Other tasks",
] as const;

/**
 * Replace this array with the approved SPPG cohort roster before publishing the form.
 */
export const STUDENT_ROSTER = [
  "Roster pending — replace with this cohort's student names",
] as const;

/**
 * Replace each placeholder with one of the approved 22 capstone project names.
 */
export const CAPSTONE_PROJECTS = [
  "Capstone Project 01 — replace with project title",
  "Capstone Project 02 — replace with project title",
  "Capstone Project 03 — replace with project title",
  "Capstone Project 04 — replace with project title",
  "Capstone Project 05 — replace with project title",
  "Capstone Project 06 — replace with project title",
  "Capstone Project 07 — replace with project title",
  "Capstone Project 08 — replace with project title",
  "Capstone Project 09 — replace with project title",
  "Capstone Project 10 — replace with project title",
  "Capstone Project 11 — replace with project title",
  "Capstone Project 12 — replace with project title",
  "Capstone Project 13 — replace with project title",
  "Capstone Project 14 — replace with project title",
  "Capstone Project 15 — replace with project title",
  "Capstone Project 16 — replace with project title",
  "Capstone Project 17 — replace with project title",
  "Capstone Project 18 — replace with project title",
  "Capstone Project 19 — replace with project title",
  "Capstone Project 20 — replace with project title",
  "Capstone Project 21 — replace with project title",
  "Capstone Project 22 — replace with project title",
] as const;

const nonPlaceholder = (fieldName: string) =>
  z
    .string()
    .min(1, `Please select your ${fieldName}.`)
    .refine(
      value => !value.includes("pending") && !value.includes("— replace"),
      `The ${fieldName} list must be configured before the form can be submitted.`,
    );

export const CommunityServiceResponseSchema = z.object({
  studentName: nonPlaceholder("name"),
  capstoneProject: nonPlaceholder("project name"),
  serviceDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a valid date."),
  attendance: z.enum(ATTENDANCE_OPTIONS, {
    message: "Please select an attendance range.",
  }),
  participation: z
    .array(z.enum(PARTICIPATION_OPTIONS))
    .min(1, "Select at least one participation activity."),
  contributions: z
    .array(z.enum(CONTRIBUTION_OPTIONS))
    .min(1, "Select at least one contribution type."),
  completedAssignedTask: z.enum(["yes", "no"], {
    message: "Please indicate whether you completed your assigned task.",
  }),
  mentorRating: z.enum(MENTOR_OPTIONS, {
    message: "Please select a mentor assessment.",
  }),
  improvementFeedback: z
    .string()
    .trim()
    .min(10, "Please share at least a short reflection on possible improvements."),
  conflictResolution: z.enum(CONFLICT_RESOLUTION_OPTIONS, {
    message: "Please select the statement that best describes your experience.",
  }),
  assignedTasks: z
    .array(z.enum(ASSIGNED_TASK_OPTIONS))
    .min(1, "Select at least one assigned task."),
});

export type CommunityServiceResponse = z.infer<typeof CommunityServiceResponseSchema>;
