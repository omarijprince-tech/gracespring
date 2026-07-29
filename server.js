import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/* Cart recovery. Hourly is fine: the job only picks up orders in the 1h–24h
   abandoned window and stamps each one, so nothing is emailed twice. */
crons.interval(
  "abandoned cart recovery",
  { hours: 1 },
  internal.emails.sendAbandonedCartEmails,
  {}
);

export default crons;
