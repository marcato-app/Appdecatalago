"use client";

import { useActionState, useState } from "react";
import { updateStorefrontSettingsAction, type StorefrontSettingsFormState } from "@/app/dashboard/loja/actions";
import type { StorefrontSettings } from "@/lib/storefront-settings";

const initialState: StorefrontSettingsFormState = {};

const inputClass =
  "rounded-lg border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-zinc-700 dark:focus:border-violet-400 dark:bg-transparent";

export function StorefrontSettingsForm({ settings }: { settings: StorefrontSettings }) {
  const [state, formAction, isPending] = useActionState(updateStorefrontSettingsAction, initialState);
  const [installmentsEnabled, setInstallmentsEnabled] = useState(settings.installments.enabled);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Selos de confiança</span>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="badgeVerified" defaultChecked={settings.badges.verified} />
          Loja Verificada
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="badgeRespondsFast" defaultChecked={settings.badges.respondsFast} />
          Responde Rápido
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="badgeReadyDelivery" defaultChecked={settings.badges.readyDelivery} />
          Pronta Entrega
        </label>
      </div>

      <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="installmentsEnabled"
            checked={installmentsEnabled}
            onChange={(event) => setInstallmentsEnabled(event.target.checked)}
          />
          Mostrar parcelamento na vitrine
        </label>
        {installmentsEnabled ? (
          <div className="flex items-end gap-3 pl-6">
            <div className="flex flex-col gap-1">
              <label htmlFor="maxInstallments" className="text-xs text-zinc-500">
                Máx. parcelas
              </label>
              <input
                id="maxInstallments"
                name="maxInstallments"
                type="number"
                min={1}
                max={12}
                defaultValue={settings.installments.maxInstallments}
                className={`${inputClass} w-20`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="feeRatePct" className="text-xs text-zinc-500">
                Taxa por parcela (%)
              </label>
              <input
                id="feeRatePct"
                name="feeRatePct"
                type="text"
                inputMode="decimal"
                defaultValue={settings.installments.feeRatePct}
                className={`${inputClass} w-24`}
              />
            </div>
          </div>
        ) : (
          <>
            <input type="hidden" name="maxInstallments" value={settings.installments.maxInstallments} />
            <input type="hidden" name="feeRatePct" value={settings.installments.feeRatePct} />
          </>
        )}
      </div>

      <div className="flex flex-col gap-1 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <label htmlFor="displayMode" className="text-sm font-medium">
          Visualização dos aparelhos
        </label>
        <select id="displayMode" name="displayMode" defaultValue={settings.displayMode} className={inputClass}>
          <option value="compacto">Compacto (grade)</option>
          <option value="grande">Grande (lista)</option>
        </select>
      </div>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-green-600">Salvo!</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 self-start rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
