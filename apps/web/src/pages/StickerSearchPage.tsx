import { FormEvent, useMemo, useState } from "react";
import { Repeat2, Search } from "lucide-react";
import { Link } from "react-router-dom";
import type { StickerDto, StickerMissingExchangeHint, StickerMissingUsersDto } from "@mundial-album/shared";
import { formatStickerAlbumLocation } from "@mundial-album/shared";
import { api } from "../api/client";
import { getErrorMessage } from "../api/error-message";
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
      <section className="work-panel sticker-search-panel stack">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Consulta rápida</p>
            <h2>Buscador de figuritas</h2>
          </div>
        </div>
        <SearchPageSkeleton />
      </section>
    );
  }

  return (
    <section className="work-panel sticker-search-panel">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Consulta rápida</p>
          <h2>Buscador de figuritas</h2>
          <p>
            {currentUser
              ? "Escribí un código y mirá quién no la tiene y con quién podrías cambiarla."
              : "Escribí un código y mirá quién todavía no la tiene."}
          </p>
        </div>
      </div>

      <form className="form-grid sticker-search-form" onSubmit={(event) => void handleSearch(event)}>
        <label className="field">
          <span>Código</span>
          <input
            value={code}
            list="sticker-code-suggestions"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="ARG10"
            onChange={(event) => {
              setCode(event.currentTarget.value.toUpperCase());
              setErrorMessage(null);
            }}
          />
        </label>

        <datalist id="sticker-code-suggestions">
          {stickers.map((sticker) => (
            <option key={sticker.id} value={sticker.code} label={formatStickerLabel(sticker)} />
          ))}
        </datalist>

        <button className="primary-button sticker-search-button" type="submit" disabled={isSearching}>
          <Search size={18} aria-hidden="true" />
          {isSearching ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {error ? <p className="alert">{getErrorMessage(error)}</p> : null}
      {errorMessage ? <p className="alert">{errorMessage}</p> : null}

      {result ? (
        <div className="sticker-search-result">
          <div className="sticker-search-summary">
            <p className="eyebrow">Figurita</p>
            <h3>{result.sticker.code}</h3>
            {selectedSticker?.playerName || selectedSticker?.team ? (
              <p className="sticker-search-meta">
                {[selectedSticker?.playerName, selectedSticker?.team].filter(Boolean).join(" · ")}
              </p>
            ) : null}
            {selectedSticker ? (
              <p className="sticker-search-meta">{formatStickerAlbumLocation(selectedSticker)}</p>
            ) : null}
          </div>

          {result.users.length === 0 ? (
            <p className="success-banner">Todos los usuarios ya tienen esta figurita.</p>
          ) : (
            <>
              <p className="sticker-search-result-label">
                Le falta a {result.users.length} {result.users.length === 1 ? "usuario" : "usuarios"}
                {currentUser && exchangeMatches > 0
                  ? ` · ${exchangeMatches} con posibilidad de cambio para vos`
                  : null}
              </p>
              <div className="user-list">
                {result.users.map(({ user, exchangeHint }) => (
                  <div key={user.id} className="user-list-item">
                    <strong>@{user.name}</strong>
                    {exchangeHint ? (
                      <Link className="sticker-search-exchange-hint" to="/intercambio" title="Ir a Intercambio">
                        <Repeat2 size={14} aria-hidden="true" />
                        {getExchangeHintLabel(exchangeHint)}
                      </Link>
                    ) : null}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
