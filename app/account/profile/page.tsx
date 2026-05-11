import { ProfileForm } from "@/components/account/ProfileForm";
import { getAccountUser } from "@/lib/account-user";

export const dynamic = "force-dynamic";
export const metadata = { title: "Профиль — KROOKIES" };

export default async function AccountProfilePage() {
  const user = await getAccountUser();

  return <ProfileForm user={user} />;
}
