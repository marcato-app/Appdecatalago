import { redirect } from "next/navigation";
import { requireOwnedStore } from "@/lib/stores";

export default async function DashboardPage() {
  await requireOwnedStore(); // redirects to /dashboard/loja/nova when there's no store yet
  redirect("/dashboard/loja");
}
