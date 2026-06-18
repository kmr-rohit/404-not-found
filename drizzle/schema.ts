import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const outputTypeEnum = pgEnum("output_type", [
  "summary",
  "notes",
  "tweet",
]);

export const conferences = pgTable("conferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const talks = pgTable("talks", {
  id: uuid("id").defaultRandom().primaryKey(),
  conferenceId: uuid("conference_id")
    .notNull()
    .references(() => conferences.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  speaker: text("speaker"),
  track: text("track"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  transcript: text("transcript").default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const photos = pgTable("photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  talkId: uuid("talk_id")
    .notNull()
    .references(() => talks.id, { onDelete: "cascade" }),
  fileId: text("file_id").notNull(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const generatedOutputs = pgTable("generated_outputs", {
  id: uuid("id").defaultRandom().primaryKey(),
  talkId: uuid("talk_id")
    .notNull()
    .references(() => talks.id, { onDelete: "cascade" }),
  type: outputTypeEnum("type").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const conferencesRelations = relations(conferences, ({ many }) => ({
  talks: many(talks),
}));

export const talksRelations = relations(talks, ({ one, many }) => ({
  conference: one(conferences, {
    fields: [talks.conferenceId],
    references: [conferences.id],
  }),
  photos: many(photos),
  outputs: many(generatedOutputs),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  talk: one(talks, {
    fields: [photos.talkId],
    references: [talks.id],
  }),
}));

export const generatedOutputsRelations = relations(
  generatedOutputs,
  ({ one }) => ({
    talk: one(talks, {
      fields: [generatedOutputs.talkId],
      references: [talks.id],
    }),
  }),
);

export type Conference = typeof conferences.$inferSelect;
export type Talk = typeof talks.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type GeneratedOutput = typeof generatedOutputs.$inferSelect;
