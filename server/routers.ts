import { CommunityServiceResponseSchema } from "@shared/communityService";
import { COOKIE_NAME } from "@shared/const";
import { createCommunityServiceSubmission } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  communityService: router({
    submit: publicProcedure.input(CommunityServiceResponseSchema).mutation(async ({ input }) => {
      const submissionId = await createCommunityServiceSubmission(input);
      return {
        submissionId,
        submittedAt: new Date().toISOString(),
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
