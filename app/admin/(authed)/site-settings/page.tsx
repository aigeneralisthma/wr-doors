import { getAllSiteSettingsAdmin } from "@/lib/supabase/admin-queries";
import { SiteSettingsForm } from "./site-settings-form";

export default async function AdminSiteSettingsPage() {
  const settings = await getAllSiteSettingsAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Site settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit the hero copy, contact info, and business hours shown across the
          public site. Changes appear within ~60 seconds (ISR revalidation).
        </p>
      </div>

      <SiteSettingsForm settings={settings} />
    </div>
  );
}
