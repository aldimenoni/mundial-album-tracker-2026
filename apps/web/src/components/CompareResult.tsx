import type { CompareAlbumDto, StickerDto } from "@mundial-album/shared";

function stickerCodes(stickers: StickerDto[]): string {
  return stickers.length > 0 ? stickers.map((sticker) => sticker.code).join(", ") : "Sin coincidencias";
}

export function CompareResult({ result }: { result: CompareAlbumDto }) {
  return (
    <section className="compare-result">
      <div className="compare-line">
        <span>Te puede dar</span>
        <strong>{stickerCodes(result.theyCanGive)}</strong>
      </div>
      <div className="compare-line">
        <span>Vos le podes dar</span>
        <strong>{stickerCodes(result.iCanGive)}</strong>
      </div>

      <div className="suggestions">
        <h3>Cambios sugeridos</h3>
        {result.suggestions.length === 0 ? (
          <p className="empty-state">No hay cambios uno a uno por ahora.</p>
        ) : (
          <div className="suggestion-list">
            {result.suggestions.map((suggestion) => (
              <article key={`${suggestion.receive.id}-${suggestion.give.id}`}>
                <span>Recibis {suggestion.receive.code}</span>
                <strong>Das {suggestion.give.code}</strong>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
