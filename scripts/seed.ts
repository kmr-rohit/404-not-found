import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  conferences,
  generatedOutputs,
  photos,
  talks,
} from "../drizzle/schema";
import {
  MOCK_CONFERENCE,
  MOCK_OUTPUTS,
  MOCK_PHOTOS,
  MOCK_TALKS,
} from "../src/lib/mock-data";

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required to seed the database.");
    process.exit(1);
  }

  const sql = neon(url);
  const db = drizzle(sql);

  console.log("Seeding SessionScribe data...");

  await db.insert(conferences).values({
    id: MOCK_CONFERENCE.id,
    name: MOCK_CONFERENCE.name,
    location: MOCK_CONFERENCE.location,
    startDate: MOCK_CONFERENCE.startDate,
    endDate: MOCK_CONFERENCE.endDate,
  }).onConflictDoNothing();

  for (const talk of MOCK_TALKS) {
    await db.insert(talks).values(talk).onConflictDoNothing();
  }

  for (const photo of MOCK_PHOTOS) {
    await db.insert(photos).values(photo).onConflictDoNothing();
  }

  for (const output of MOCK_OUTPUTS) {
    await db.insert(generatedOutputs).values(output).onConflictDoNothing();
  }

  console.log("Seed complete.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
