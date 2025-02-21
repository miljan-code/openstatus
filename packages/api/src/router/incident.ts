import { z } from "zod";

import { eq } from "@openstatus/db";
import {
  incident,
  incidentUpdate,
  insertIncidentSchema,
  insertIncidentUpdateSchema,
  page,
} from "@openstatus/db/src/schema";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const incidentRouter = createTRPCRouter({
  createIncident: protectedProcedure
    .input(insertIncidentSchema)
    .mutation(async (opts) => {
      await opts.ctx.db.insert(incident).values(opts.input).execute();
    }),

  createIncidentUpdate: protectedProcedure
    .input(insertIncidentUpdateSchema)
    .mutation(async (opts) => {
      await opts.ctx.db.insert(incidentUpdate).values(opts.input).execute();
    }),

  updateIncident: protectedProcedure
    .input(
      z.object({
        incidentId: z.number(),
        status: insertIncidentSchema.pick({ status: true }),
      }),
    )
    .mutation(async (opts) => {
      await opts.ctx.db
        .update(incident)
        .set(opts.input.status)
        .where(eq(incident.id, opts.input.incidentId))
        .execute();
    }),
  getIncidentByWorkspace: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async (opts) => {
      const pageQuery = opts.ctx.db
        .select()
        .from(page)
        .where(eq(page.workspaceId, opts.input.workspaceId))
        .as("pageQuery");
      return opts.ctx.db
        .select()
        .from(incident)
        .innerJoin(pageQuery, eq(incident.pageId, pageQuery.id))
        .execute();
    }),
});
