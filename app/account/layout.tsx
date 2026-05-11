import { AccountShell } from "@/components/account/AccountShell";
import { getAccountUser } from "@/lib/account-user";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAccountUser();

  return <AccountShell user={user}>{children}</AccountShell>;
}
