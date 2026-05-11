import { cache } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const getAccountUser = cache(async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return user;
});

export const getNamedAccountUser = cache(async () => {
  const user = await getAccountUser();

  if (user.role !== "admin" && !user.name?.trim()) {
    redirect("/account/profile?required=name");
  }

  return user;
});
