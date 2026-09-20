"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome."),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

export interface FormState {
  error?: string;
  notice?: string;
}

function translateSignupError(message: string): string {
  if (message.includes("already registered") || message.includes("already exists")) {
    return "Já existe uma conta com esse e-mail.";
  }
  if (message.includes("Password")) {
    return "Senha inválida — use pelo menos 8 caracteres.";
  }
  return message;
}

export async function signupAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { name, email, password } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });

  if (error) {
    return { error: translateSignupError(error.message) };
  }
  if (!data.user) {
    return { error: "Não foi possível criar a conta." };
  }

  const existingProfile = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!existingProfile) {
    await db.insert(users).values({ email, name, authProviderId: data.user.id });
  }

  if (!data.session) {
    // Email confirmation is enabled on this Supabase project — no session
    // yet, so there's nothing to redirect into.
    return { notice: "Conta criada! Confirme seu e-mail (verifique a caixa de entrada) e depois faça login." };
  }

  redirect("/dashboard");
}
