"use client"

import * as React from "react"
import { KeyRound, ShieldCheck, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api, ApiError, clearApiKey, getApiKey, setApiKey, type MeResponse } from "@/lib/api"

type Status =
  | { kind: "loading" }
  | { kind: "none" }
  | { kind: "ok"; me: MeResponse }
  | { kind: "error"; message: string }

// La lectura es pública. Para editar perfiles o sensores, el backend pide una
// clave (header X-API-Key). Esta tarjeta la guarda solo en este navegador.
export function AdminAccessCard() {
  const [status, setStatus] = React.useState<Status>({ kind: "loading" })
  const [draft, setDraft] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  const check = React.useCallback(async (key: string | null) => {
    if (!key) {
      setStatus({ kind: "none" })
      return
    }
    try {
      const me = await api.getMe(key)
      setStatus({ kind: "ok", me })
    } catch (error) {
      setStatus({
        kind: "error",
        message:
          error instanceof ApiError && error.status === 401
            ? "La clave guardada no es válida o fue revocada."
            : error instanceof Error
              ? error.message
              : "No se pudo verificar la clave.",
      })
    }
  }, [])

  React.useEffect(() => {
    check(getApiKey())
  }, [check])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const key = draft.trim()
    if (!key) return

    setSaving(true)
    try {
      const me = await api.getMe(key)
      setApiKey(key)
      setDraft("")
      setStatus({ kind: "ok", me })
    } catch (error) {
      setStatus({
        kind: "error",
        message:
          error instanceof ApiError && error.status === 401
            ? "Esa clave no es válida o fue revocada. No se guardó."
            : error instanceof Error
              ? error.message
              : "No se pudo verificar la clave.",
      })
    } finally {
      setSaving(false)
    }
  }

  function handleRemove() {
    clearApiKey()
    setStatus({ kind: "none" })
  }

  const hasStoredKey = status.kind === "ok" || status.kind === "error"

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <KeyRound className="size-4" />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="font-medium leading-tight">Acceso de administrador</p>
          <p className="text-xs text-muted-foreground">
            Ver datos no requiere clave. Para administrar cines, salas, perfiles y sensores, pegá tu clave de API. Se
            guarda solo en este navegador; sin ella, los botones de edición no aparecen.
          </p>
        </div>
      </div>

      {status.kind === "ok" && status.me.authenticated && (
        <p className="flex items-center gap-2 text-sm text-status-ok">
          <ShieldCheck className="size-4 shrink-0" />
          Conectado como {status.me.client?.name}
          {status.me.permissions.length > 0
            ? ` · puede editar: ${status.me.permissions.join(", ")}`
            : " · esta clave no tiene permisos de escritura"}
        </p>
      )}

      {status.kind === "error" && (
        <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
          <ShieldAlert className="size-4 shrink-0" />
          {status.message}
        </p>
      )}

      {status.kind === "none" && (
        <p className="text-sm text-muted-foreground">No hay ninguna clave guardada: la app funciona en modo lectura.</p>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="api-key">{hasStoredKey ? "Reemplazar clave" : "Clave de API"}</Label>
          <Input
            id="api-key"
            type="password"
            autoComplete="off"
            placeholder="sk_…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="font-mono"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saving || !draft.trim()}>
            {saving ? "Verificando..." : "Guardar"}
          </Button>
          {hasStoredKey && (
            <Button type="button" variant="outline" onClick={handleRemove}>
              Quitar clave
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
