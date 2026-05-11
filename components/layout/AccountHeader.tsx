import Link from "next/link";
import { User } from "@prisma/client";
import { LogoutButton } from "@/components/auth/LogoutButton";

export function AccountHeader({ user }: { user: User }) {
  return (
    <header className="border-b border-[#E6AECB] bg-[#FFFFFF]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-8">
        <div><Link href="/account" className="text-2xl font-black text-[#54342C]">KROOKIES</Link><p className="mt-1 text-sm text-[#54342C]">{user.name || user.email || user.phone || "Личный кабинет"}</p></div>
        <nav className="flex flex-wrap items-center gap-3">
          <Link href="/account" className="rounded-full bg-[#FFF4F8] px-4 py-2 text-sm font-semibold text-[#54342C] hover:bg-[#E6AECB]">Кабинет</Link>
          <Link href="/account/orders" className="rounded-full bg-[#FFF4F8] px-4 py-2 text-sm font-semibold text-[#54342C] hover:bg-[#E6AECB]">Заказы</Link>
          <Link href="/" className="rounded-full bg-[#FFF4F8] px-4 py-2 text-sm font-semibold text-[#54342C] hover:bg-[#E6AECB]">Витрина</Link>
          <LogoutButton variant="dark" />
        </nav>
      </div>
    </header>
  );
}
