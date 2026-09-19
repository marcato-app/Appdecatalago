import { logoutAction } from "@/app/dashboard/actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button type="submit" className="text-sm text-zinc-500 underline hover:text-foreground">
        Sair
      </button>
    </form>
  );
}
