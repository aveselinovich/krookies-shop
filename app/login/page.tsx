import { LoginForm } from "@/components/auth/LoginForm";
export const metadata = { title: "Вход — KROOKIES" };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) { const { next } = await searchParams; return <main className="min-h-screen bg-[#FFF9FB]"><section className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-5 py-12 md:px-8"><div className="w-full max-w-xl"><LoginForm nextUrl={next} /></div></section></main>; }
