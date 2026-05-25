import { FormEvent, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Repeat2, Search, Users } from "lucide-react";
import { Link } from "react-router-dom";
import type { StickerDto, StickerMissingExchangeHint, StickerMissingUsersDto } from "@mundial-album/shared";
import { formatStickerAlbumLocation } from "@mundial-album/shared";
import { api } from "../api/client";
import { getErrorMessage } from "../api/error-message";
import { AppCard } from "../components/ui/AppCard";
import { AlertBanner, EmptyState, SectionHeader } from "../components/ui/Badges";
import { GradientButton } from "../components/ui/GradientButton";
import { SearchPageSkeleton } from "../components/ui/Skeleton";
import { useQuery } from "../hooks/useQuery";
import { useUser } from "../state/user-store";

function normalizeStickerCode(value: string): string {
  return value.trim().toUpperCase();
}

function formatStickerLabel(sticker: StickerDto): string {
  const details = [sticker.playerName, sticker.team].filter(Boolean).join(" · ");
  return details ? `${sticker.code} · ${details}` : sticker.code;
}

function getExchangeHintLabel(hint: StickerMissingExchangeHint): string {
  if (hint === "give-this") {
    return "Podés darle esta";
  }

  return "Cambio posible";
}

export function StickerSearchPage() {
  const { currentUser } = useUser();
  const { data: stickers = [], error, isLoading: isLoadingCatalog } = useQuery(
    "stickers:catalog",
    () => api.listStickers(),
    { staleTime: 10 * 60_000 }
  );
  const [code, setCode] = useState("");
  const [result, setResult] = useState<StickerMissingUsersDto | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stickerByCode = useMemo(
    () => new Map(stickers.map((sticker) => [sticker.code, sticker])),
    [stickers]
  );

  async function handleSearch(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const normalizedCode = normalizeStickerCode(code);

    if (!normalizedCode) {
      setErrorMessage("Escribí un código de figurita.");
      setResult(null);
      return;
    }

    if (!stickerByCode.has(normalizedCode)) {
      setErrorMessage(`No encontramos el código ${normalizedCode}. Elegí uno de la lista sugerida.`);
      setResult(null);
      return;
    }

    setIsSearching(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const searchResult = await api.findUsersMissingSticker(normalizedCode, currentUser?.id);
      setResult(searchResult);
      setCode(normalizedCode);
    } catch (searchError: unknown) {
      setErrorMessage(getErrorMessage(searchError));
    } finally {
      setIsSearching(false);
    }
  }

  const selectedSticker = result?.sticker ?? stickerByCode.get(normalizeStickerCode(code)) ?? null;
  const exchangeMatches = result?.users.filter((entry) => entry.exchangeHint).length ?? 0;

  if (isLoadingCatalog && stickers.length === 0) {
    return (
      <section className="grid gap-4">
        <AppCard>
          <SectionHeader eyebrow="Consulta rápida" title="Buscador de figuritas" />
        </AppCard>
        <SearchPageSkeleton />
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <AppCard>
        <SectionHeader
          eyebrow="Consulta rápida"
          title="Buscador de figuritas"
          subtitle={
            currentUser
              ? "Mirá quién no la tiene y con quién podrías cambiarla."
              : "Mirá quién todavía no la tiene."
          }
        />

        <form className="mt-4 grid gap-3" onSubmit={(event) => void handleSearch(event)}>
          <label className="field">
            <span>Código</span>
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/45"
                aria-hidden="true"
              />
              <input
                value={code}
                list="sticker-code-suggestions"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="ARG10"
                className="!pl-11 !text-lg !font-black !tracking-wider"
                onChange={(event) => {
                  setCode(event.currentTarget.value.toUpperCase());
                  setErrorMessage(null);
                }}
              />
            </div>
          </label>

          <datalist id="sticker-code-suggestions">
            {stickers.map((sticker) => (
              <option key={sticker.id} value={sticker.code} label={formatStickerLabel(sticker)} />
            ))}
          </datalist>

          <GradientButton type="submit" size="lg" disabled={isSearching}>
            <Search size={18} aria-hidden="true" />
            {isSearching ? "Buscando..." : "Buscar figurita"}
          </GradientButton>
        </form>
      </AppCard>

      {error ? <AlertBanner>{getErrorMessage(error)}</AlertBanner> : null}
      {errorMessage ? <AlertBanner>{errorMessage}</AlertBanner> : null}

      {result ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-3"
        >
          <AppCard glow className="p-4">
            <div>
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-panini-gold">
                Figurita
              </p>
              <h3 className="mt-1 text-3xl font-black tracking-wide text-white">{result.sticker.code}</h3>
              {selectedSticker?.playerName || selectedSticker?.team ? (
                <p className="mt-2 text-sm font-semibold text-white/70">
                  {[selectedSticker?.playerName, selectedSticker?.team].filter(Boolean).join(" · ")}
                </p>
              ) : null}
              {selectedSticker ? (
                <p className="mt-1 text-xs font-bold text-white/50">
                  {formatStickerAlbumLocation(selectedSticker)}
                </p>
              ) : null}
            </div>
          </AppCard>

          {result.users.length === 0 ? (
            <AlertBanner tone="success">
              Todos los usuarios ya tienen esta figurita. Colección completa 🎉
            </AlertBanner>
          ) : (
            <>
              <AppCard className="flex items-center gap-3 p-4">
                <Users className="text-emerald-300" size={20} />
                <p className="text-sm font-bold text-white/80">
                  {result.users.length === 1
                    ? "1 persona la necesita"
                    : `${result.users.length} personas la necesitan`}
                  {currentUser && exchangeMatches > 0
                    ? ` · ${exchangeMatches} con posibilidad de cambio para vos`
                    : null}
                </p>
              </AppCard>

              <div className="grid gap-2">
                {result.users.map(({ user, exchangeHint }) => (
                  <AppCard key={user.id} className="flex items-center justify-between gap-3 p-3">
                    <strong className="truncate text-sm font-black text-white">@{user.name}</strong>
                    {exchangeHint ? (
                      <Link
                        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-extrabold text-emerald-100 no-underline"
                        to="/intercambio"
                        title="Ir a Intercambio"
                      >
                        <Repeat2 size={14} aria-hidden="true" />
                        {getExchangeHintLabel(exchangeHint)}
                      </Link>
                    ) : (
                      <span className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-extrabold text-rose-100">
                        Le falta
                      </span>
                    )}
                  </AppCard>
                ))}
              </div>
            </>
          )}
        </motion.div>
      ) : (
        <EmptyState
          title="Buscá por código"
          description="Probá ARG10, BRA14 o cualquier código del álbum."
          icon={<Search size={28} />}
        />
      )}
    </section>
  );
}
