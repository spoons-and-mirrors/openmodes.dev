import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Fetch models data every hour
crons.hourly(
  "fetch models data",
  { minuteUTC: 0 }, // At the top of each hour
  internal.models.fetchModelsFromAPI,
);

export default crons;
