// A strip across the top of every page on the sandbox (the dev branch) and
// on pull request previews, so they're never mistaken for the live site.
// Nothing on the live site or when running locally.
const CONTEXT = process.env.SITE_DEPLOY_CONTEXT;

export default function SandboxBanner() {
  if (!CONTEXT || CONTEXT === "production") return null;
  const label = CONTEXT === "branch-deploy" ? "SANDBOX" : "PREVIEW";
  return (
    <div
      role="status"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 60,
        padding: "6px 16px",
        textAlign: "center",
        fontSize: 13,
        fontWeight: 600,
        color: "#fff",
        backgroundColor: "#b45309",
        backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,.08) 0 12px, transparent 12px 24px)",
      }}
    >
      {label} · Afon Training · not the live site: changes waiting to go live
    </div>
  );
}
