// Netlify scheduled function: runs the morning check at 7am UK winter time
// (06:00 UTC). Netlify runs scheduled functions on the published
// production deploy only; on the sandbox, use "Run the morning check now"
// in Admin > Settings instead.

const morningCheck = async () => {
  const secret = process.env.CRON_SECRET;
  const site = process.env.URL;
  if (!secret || !site) {
    console.log("Morning check skipped: CRON_SECRET or URL not set.");
    return;
  }
  const res = await fetch(`${site}/api/cron/daily`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
  });
  console.log(`Morning check: ${res.status} ${await res.text()}`);
};

export default morningCheck;

export const config = { schedule: "0 6 * * *" };
