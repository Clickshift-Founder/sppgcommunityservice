# SPPG Community Service Form Configuration

The form is ready for use once its two programme-specific lists are supplied. Both lists are intentionally centralised in `shared/communityService.ts`, so no changes to the form layout or database logic are required.

| Required list | Exact location | What to replace |
|---|---|---|
| Cohort student roster | `STUDENT_ROSTER` | Replace the single roster-pending placeholder with every student’s full name for the relevant SPPG Nigeria cohort. |
| Capstone project list | `CAPSTONE_PROJECTS` | Replace the 22 numbered placeholder entries with the official capstone project names for the year. Keep exactly 22 items unless SPPG formally changes the project count. |

The application rejects any selection still containing `pending` or `— replace`, which prevents incomplete programme setup from creating unusable records. The remaining question options are also centralised in the same file and can be adjusted if programme terminology changes.

The form uses a public submission endpoint. Student responses are persisted in the `communityServiceSubmissions` database table; multi-select answers are stored as JSON text so that all selected activities, contributions, and tasks remain associated with each entry.

> Before publishing, replace the two lists and submit one completed internal test record to confirm that the dropdown values match the cohort’s approved programme data.
