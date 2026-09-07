import { trpc } from "@/lib/trpc";
import {
  ASSIGNED_TASK_OPTIONS,
  ATTENDANCE_OPTIONS,
  CAPSTONE_PROJECTS,
  CommunityServiceResponseSchema,
  CONFLICT_RESOLUTION_OPTIONS,
  CONTRIBUTION_OPTIONS,
  MENTOR_OPTIONS,
  PARTICIPATION_OPTIONS,
  STUDENT_ROSTER,
  type CommunityServiceResponse,
} from "@shared/communityService";
import { AlertCircle, ArrowRight, Check, CheckCircle2, ClipboardCheck, Save, Send } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

const DRAFT_KEY = "sppg-community-service-form-draft-v1";

const emptyResponse: CommunityServiceResponse = {
  studentName: "",
  capstoneProject: "",
  serviceDate: "",
  attendance: undefined as unknown as CommunityServiceResponse["attendance"],
  participation: [],
  contributions: [],
  completedAssignedTask: undefined as unknown as CommunityServiceResponse["completedAssignedTask"],
  mentorRating: undefined as unknown as CommunityServiceResponse["mentorRating"],
  improvementFeedback: "",
  conflictResolution: undefined as unknown as CommunityServiceResponse["conflictResolution"],
  assignedTasks: [],
};

type MultiField = "participation" | "contributions" | "assignedTasks";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-[#a83e31]" role="alert">
      <AlertCircle className="mt-px size-3.5 shrink-0" />
      {message}
    </p>
  );
}

function FormSection({ number, title, caption, children }: { number: string; title: string; caption: string; children: React.ReactNode }) {
  return (
    <section className="section-enter border-t border-[#d7d6cc] py-8 sm:py-10">
      <div className="grid gap-5 md:grid-cols-[9rem_1fr]">
        <div>
          <p className="font-display text-3xl leading-none text-[#c65a3b]">{number}</p>
          <p className="mt-2 max-w-28 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#6c746d]">Community record</p>
        </div>
        <div>
          <h2 className="font-display text-[1.7rem] leading-tight text-[#163d31] sm:text-[2rem]">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667069]">{caption}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [formData, setFormData] = useState<CommunityServiceResponse>(emptyResponse);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState<{ id: number; submittedAt: string } | null>(null);
  const submit = trpc.communityService.submit.useMutation();

  useEffect(() => {
    const stored = localStorage.getItem(DRAFT_KEY);
    if (!stored) return;
    try {
      setFormData({ ...emptyResponse, ...JSON.parse(stored) });
      setSaved(true);
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  const completedCount = useMemo(() => {
    const checkpoints = [
      Boolean(formData.studentName && !formData.studentName.includes("pending")),
      Boolean(formData.capstoneProject && !formData.capstoneProject.includes("— replace")),
      Boolean(formData.serviceDate && formData.attendance),
      formData.participation.length > 0,
      formData.contributions.length > 0,
      Boolean(formData.completedAssignedTask && formData.mentorRating),
      Boolean(formData.improvementFeedback.trim() && formData.conflictResolution && formData.assignedTasks.length),
    ];
    return checkpoints.filter(Boolean).length;
  }, [formData]);

  const update = <K extends keyof CommunityServiceResponse>(field: K, value: CommunityServiceResponse[K]) => {
    setFormData(previous => ({ ...previous, [field]: value }));
    setErrors(previous => ({ ...previous, [field]: "" }));
    setSaved(false);
  };

  const toggleArray = (field: MultiField, value: string) => {
    const current = formData[field] as string[];
    const next = current.includes(value) ? current.filter(item => item !== value) : [...current, value];
    update(field, next as CommunityServiceResponse[typeof field]);
  };

  const saveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    setSaved(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = CommunityServiceResponseSchema.safeParse(formData);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.issues.forEach(issue => {
        const field = String(issue.path[0]);
        if (!nextErrors[field]) nextErrors[field] = issue.message;
      });
      setErrors(nextErrors);
      document.getElementById("form-start")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    submit.mutate(parsed.data, {
      onSuccess: response => {
        localStorage.removeItem(DRAFT_KEY);
        setSubmitted({ id: response.submissionId, submittedAt: response.submittedAt });
      },
      onError: error => setErrors({ form: error.message || "Your response could not be submitted. Please try again." }),
    });
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f4f0e7] px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-3xl border border-[#d7d6cc] bg-[#fffdf8] p-7 shadow-[0_20px_55px_rgba(30,48,39,0.08)] sm:p-12">
          <div className="flex size-14 items-center justify-center rounded-full bg-[#eaf3ed] text-[#075f4e]"><CheckCircle2 className="size-7" /></div>
          <p className="mt-8 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#c65a3b]">Record received</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-[#163d31] sm:text-5xl">Thank you for documenting your service.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#657069]">Your community-service record has been securely received. Keep the reference below for your own records.</p>
          <div className="mt-8 grid gap-4 border-y border-[#d7d6cc] py-5 sm:grid-cols-2">
            <div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7a807b]">Submission reference</p><p className="mt-1 font-semibold text-[#163d31]">SPPG-CS-{String(submitted.id).padStart(5, "0")}</p></div>
            <div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7a807b]">Received</p><p className="mt-1 font-semibold text-[#163d31]">{new Date(submitted.submittedAt).toLocaleString()}</p></div>
          </div>
          <button onClick={() => { setSubmitted(null); setFormData(emptyResponse); }} className="mt-8 inline-flex items-center gap-2 bg-[#075f4e] px-5 py-3 text-sm font-extrabold text-white transition active:scale-[0.97] hover:bg-[#064f42]">Submit another record <ArrowRight className="size-4" /></button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f0e7] text-[#1f2b27]">
      <div className="mx-auto max-w-[1540px] lg:grid lg:grid-cols-[minmax(295px,0.8fr)_minmax(0,1.8fr)]">
        <aside className="relative overflow-hidden bg-[#075f4e] text-white lg:min-h-screen">
          <div className="absolute inset-0 opacity-20 mix-blend-screen" style={{ backgroundImage: "url('/manus-storage/sppg-contour-field_c046ad21.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="relative flex h-full flex-col p-6 sm:p-9 lg:sticky lg:top-0 lg:h-screen lg:p-10">
            <div className="flex items-center gap-3">
              <img src="/manus-storage/sppg-civic-mark_ba0a1f30.png" alt="SPPG civic mark" className="size-10 object-contain" />
              <div><p className="text-[11px] font-extrabold tracking-[0.18em]">SPPG / NIGERIA</p><p className="mt-0.5 text-xs text-white/70">Community service record</p></div>
            </div>
            <div className="mt-12 max-w-sm lg:mt-18">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#f1c87f]">Year-end reflection</p>
              <h1 className="mt-4 font-display text-[2.7rem] leading-[0.98] sm:text-5xl lg:text-[3.8rem]">Record the work behind your impact.</h1>
              <p className="mt-6 max-w-xs text-sm leading-6 text-white/76">A considered record of how you showed up for your capstone community project, the people you worked with, and what could be improved.</p>
            </div>
            <div className="mt-10 border-t border-white/20 pt-6 lg:mt-auto">
              <div className="flex items-end justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/60">Record progress</p><p className="mt-1 text-2xl font-semibold">{completedCount} <span className="text-base font-medium text-white/60">/ 7</span></p></div><ClipboardCheck className="size-7 text-[#f1c87f]" /></div>
              <div className="mt-4 h-1.5 bg-white/15"><div className="h-full bg-[#f1c87f] transition-[width] duration-200" style={{ width: `${(completedCount / 7) * 100}%` }} /></div>
              <p className="mt-4 text-xs leading-5 text-white/65">Your details are saved in this browser when you choose <strong className="font-bold text-white">Save progress</strong>.</p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 px-5 py-8 sm:px-10 sm:py-12 lg:px-16 lg:py-16">
          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden border border-[#d7d6cc] bg-[#ebe6da] px-5 py-5 sm:px-7" style={{ backgroundImage: "url('/manus-storage/sppg-contour-field_c046ad21.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
              <div className="relative flex gap-3"><AlertCircle className="mt-0.5 size-5 shrink-0 text-[#c65a3b]" /><p className="text-sm leading-6 text-[#3e4b44]"><strong className="font-extrabold text-[#163d31]">Programme setup required.</strong> The student roster and 22 capstone project names were not supplied. Their editable placeholders are visible in the source configuration, and responses cannot be submitted until those lists are completed.</p></div>
            </div>

            <div className="mt-10 flex flex-col justify-between gap-6 border-b border-[#d7d6cc] pb-8 sm:flex-row sm:items-end">
              <div><p className="text-[11px] font-extrabold uppercase tracking-[0.17em] text-[#c65a3b]">End-of-year capstone review</p><h2 className="mt-3 max-w-2xl font-display text-4xl leading-[1.04] text-[#163d31] sm:text-5xl">Your community service project record</h2></div>
              <p className="max-w-xs text-sm leading-6 text-[#667069]">Please complete each section with the clearest reflection of your programme-year experience.</p>
            </div>

            <form id="form-start" onSubmit={handleSubmit} noValidate className="mt-1">
              {errors.form && <div className="mt-8 border border-[#d69d96] bg-[#fff3f1] p-4 text-sm font-semibold text-[#8e3428]" role="alert">{errors.form}</div>}

              <FormSection number="01" title="Your project record" caption="Identify yourself and the community capstone project you served with.">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div><label htmlFor="studentName" className="mb-2 block text-sm font-extrabold text-[#264338]">Name</label><select id="studentName" value={formData.studentName} onChange={event => update("studentName", event.target.value)} className={`form-input ${errors.studentName ? "error" : ""}`}><option value="">Select your name</option>{STUDENT_ROSTER.map(name => <option key={name} value={name}>{name}</option>)}</select><FieldError message={errors.studentName} /></div>
                  <div><label htmlFor="capstoneProject" className="mb-2 block text-sm font-extrabold text-[#264338]">Project name</label><select id="capstoneProject" value={formData.capstoneProject} onChange={event => update("capstoneProject", event.target.value)} className={`form-input ${errors.capstoneProject ? "error" : ""}`}><option value="">Select your capstone project</option>{CAPSTONE_PROJECTS.map(project => <option key={project} value={project}>{project}</option>)}</select><FieldError message={errors.capstoneProject} /></div>
                </div>
              </FormSection>

              <FormSection number="02" title="Meeting attendance" caption="Choose the date of this record and the range that best represents your group-meeting attendance.">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div><label htmlFor="serviceDate" className="mb-2 block text-sm font-extrabold text-[#264338]">Date</label><input id="serviceDate" type="date" value={formData.serviceDate} onChange={event => update("serviceDate", event.target.value)} className={`form-input ${errors.serviceDate ? "error" : ""}`} /><FieldError message={errors.serviceDate} /></div>
                  <div><label htmlFor="attendance" className="mb-2 block text-sm font-extrabold text-[#264338]">Attendance at group meetings</label><select id="attendance" value={formData.attendance ?? ""} onChange={event => update("attendance", event.target.value as CommunityServiceResponse["attendance"])} className={`form-input ${errors.attendance ? "error" : ""}`}><option value="">Choose a range</option>{ATTENDANCE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}</select><FieldError message={errors.attendance} /></div>
                </div>
              </FormSection>

              <FormSection number="03" title="Participation in group" caption="Select every activity you participated in during the programme year.">
                <fieldset><legend className="sr-only">Participation activities</legend><div className="grid gap-3 sm:grid-cols-2">{PARTICIPATION_OPTIONS.map(option => <label key={option} className="choice-card"><input type="checkbox" checked={formData.participation.includes(option)} onChange={() => toggleArray("participation", option)} /><span>{option}</span></label>)}</div></fieldset><FieldError message={errors.participation} />
              </FormSection>

              <FormSection number="04" title="Your contribution" caption="Select all the ways you personally enabled the project to move forward.">
                <fieldset><legend className="sr-only">Contribution types</legend><div className="grid gap-3 sm:grid-cols-2">{CONTRIBUTION_OPTIONS.map(option => <label key={option} className="choice-card"><input type="checkbox" checked={formData.contributions.includes(option)} onChange={() => toggleArray("contributions", option)} /><span>{option}</span></label>)}</div></fieldset><FieldError message={errors.contributions} />
              </FormSection>

              <FormSection number="05" title="Assigned task & mentorship" caption="Reflect on task completion and your project mentor’s effectiveness.">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div><p className="mb-2 text-sm font-extrabold text-[#264338]">Did you complete assigned task?</p><div className="grid grid-cols-2 gap-3"><label className="choice-card items-center"><input type="radio" name="taskCompleted" checked={formData.completedAssignedTask === "yes"} onChange={() => update("completedAssignedTask", "yes")} /><span>Yes</span></label><label className="choice-card items-center"><input type="radio" name="taskCompleted" checked={formData.completedAssignedTask === "no"} onChange={() => update("completedAssignedTask", "no")} /><span>No</span></label></div><FieldError message={errors.completedAssignedTask} /></div>
                  <div><label htmlFor="mentorRating" className="mb-2 block text-sm font-extrabold text-[#264338]">Mentors</label><select id="mentorRating" value={formData.mentorRating ?? ""} onChange={event => update("mentorRating", event.target.value as CommunityServiceResponse["mentorRating"])} className={`form-input ${errors.mentorRating ? "error" : ""}`}><option value="">Select a statement</option>{MENTOR_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}</select><FieldError message={errors.mentorRating} /></div>
                </div>
              </FormSection>

              <FormSection number="06" title="Improvement & conflict resolution" caption="Share constructive feedback on the capstone programme and describe your experience of conflict resolution.">
                <div className="grid gap-5"><div><label htmlFor="improvementFeedback" className="mb-2 block text-sm font-extrabold text-[#264338]">The capstone community projects need improvement in the following areas</label><textarea id="improvementFeedback" rows={5} value={formData.improvementFeedback} onChange={event => update("improvementFeedback", event.target.value)} placeholder="Share your overall experience and practical suggestions for improvement." className={`form-input min-h-32 resize-y ${errors.improvementFeedback ? "error" : ""}`} /><FieldError message={errors.improvementFeedback} /></div><div><label htmlFor="conflictResolution" className="mb-2 block text-sm font-extrabold text-[#264338]">Conflict resolution</label><select id="conflictResolution" value={formData.conflictResolution ?? ""} onChange={event => update("conflictResolution", event.target.value as CommunityServiceResponse["conflictResolution"])} className={`form-input ${errors.conflictResolution ? "error" : ""}`}><option value="">Choose the statement that applies</option>{CONFLICT_RESOLUTION_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}</select><FieldError message={errors.conflictResolution} /></div></div>
              </FormSection>

              <FormSection number="07" title="Tasks assigned to you" caption="Select every responsibility you held during the project. Choose “Other tasks” if an important responsibility is not listed.">
                <fieldset><legend className="sr-only">Assigned tasks</legend><div className="grid gap-3 sm:grid-cols-2">{ASSIGNED_TASK_OPTIONS.map(option => <label key={option} className="choice-card"><input type="checkbox" checked={formData.assignedTasks.includes(option)} onChange={() => toggleArray("assignedTasks", option)} /><span>{option}</span></label>)}</div></fieldset><FieldError message={errors.assignedTasks} />
              </FormSection>

              <section className="border-t border-[#d7d6cc] py-10 sm:py-12"><div className="grid gap-6 border border-[#bed1c5] bg-[#eaf3ed] p-5 sm:grid-cols-[1fr_auto] sm:items-end sm:p-7"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#075f4e]">Final check</p><h2 className="mt-2 font-display text-3xl text-[#163d31]">Ready to submit your record?</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#486158]">Your selected responses are stored as one programme-year record. You can save your progress to this browser before submitting.</p></div><div className="flex flex-col gap-3 sm:min-w-48"><button type="button" onClick={saveDraft} className="inline-flex items-center justify-center gap-2 border border-[#075f4e] bg-transparent px-5 py-3 text-sm font-extrabold text-[#075f4e] transition active:scale-[0.97] hover:bg-white"><Save className="size-4" />{saved ? "Progress saved" : "Save progress"}</button><button type="submit" disabled={submit.isPending} className="inline-flex items-center justify-center gap-2 bg-[#075f4e] px-5 py-3 text-sm font-extrabold text-white transition active:scale-[0.97] hover:bg-[#064f42] disabled:cursor-not-allowed disabled:opacity-70"><Send className="size-4" />{submit.isPending ? "Submitting..." : "Submit record"}</button></div></div></section>
            </form>
            <div className="mt-2 grid overflow-hidden border border-[#d7d6cc] bg-[#fffdf8] sm:grid-cols-[1fr_11rem]"><div className="p-6"><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#c65a3b]">A shared record</p><p className="mt-2 max-w-lg text-sm leading-6 text-[#52615a]">Each entry helps SPPG Nigeria understand how the capstone experience was lived—from participation and contribution to mentorship and conflict resolution.</p></div><img src="/manus-storage/sppg-service-record-still-life_b4a666d3.jpg" alt="Stationery prepared for a service record" className="h-40 w-full object-cover sm:h-full" /></div>
          </div>
        </div>
      </div>
    </main>
  );
}
