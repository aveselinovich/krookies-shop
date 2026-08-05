import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminCustomerForm } from "@/components/admin/AdminCustomerForm";
import { getAdminCustomerById } from "@/lib/admin-customers";
import { requireAdmin } from "@/lib/permissions";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const user = await getAdminCustomerById(id);
  if (!user) return { title: "Пользователь не найден — KROOKIES Admin" };
  return { title: `${user.name || user.phone} — KROOKIES Admin` };
}

export default async function AdminUserPage({ params }: Props) {
  const { id } = await params;
  const admin = await requireAdmin();
  const user = await getAdminCustomerById(id);

  if (!user) notFound();

  return (
    <main className="min-h-screen bg-[#FFF9FB]">
      <AdminHeader user={admin} />

      <section className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-16">
        <div className="mb-8">
          <Link
            href="/admin/users"
            className="inline-flex w-full justify-center rounded-full bg-[#54342C] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#3F2721] sm:w-auto"
          >
            ← Назад к пользователям
          </Link>
        </div>

        <AdminCustomerForm user={user} />
      </section>
    </main>
  );
}
