import { site } from "@/config/site";
import { getSiteContent, SETTINGS_LIMITS } from "@/lib/server/settings";
import { SiteSettings } from "@/components/admin/SiteSettings";

export const dynamic = "force-dynamic";

export default async function AdminSitePage() {
  const content = await getSiteContent();
  const defaults = { welcome: site.welcome.closing, who: site.welcome.who, team: site.team };
  return <SiteSettings content={content} defaults={defaults} limits={SETTINGS_LIMITS} />;
}
