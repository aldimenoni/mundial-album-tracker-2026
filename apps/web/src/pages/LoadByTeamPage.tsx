import { useMemo, useState } from "react";
import { StickerGrid } from "../components/StickerGrid";
import { TeamFilter } from "../components/TeamFilter";
import { useRequiredUser } from "../state/user-store";
import { useAlbumData } from "./use-album-data";

export function LoadByTeamPage() {
  const currentUser = useRequiredUser();
  const { album, isLoading, errorMessage, updateSticker } = useAlbumData(currentUser.id);
  const teams = useMemo(() => {
    const uniqueTeams = new Set(
      album?.stickers
        .map((item) => item.sticker.team)
        .filter((team): team is string => Boolean(team)) ?? []
    );

    return Array.from(uniqueTeams).sort((first, second) => first.localeCompare(second));
  }, [album]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const activeTeam = selectedTeam || teams[0] || "";
  const filteredStickers =
    album?.stickers.filter((item) => item.sticker.team === activeTeam) ?? [];

  return (
    <section className="stack">
      <div className="page-heading">
        <p className="eyebrow">Carga rapida</p>
        <h2>Por equipo</h2>
        <p>Seleccioná una sección y actualizá solo esas figuritas.</p>
      </div>

      {errorMessage ? <p className="alert">{errorMessage}</p> : null}
      {teams.length > 0 ? (
        <TeamFilter teams={teams} selectedTeam={activeTeam} onSelectTeam={setSelectedTeam} />
      ) : null}
      {isLoading ? <p className="empty-state">Cargando equipos...</p> : null}
      <StickerGrid items={filteredStickers} editable compact onUpdate={updateSticker} />
    </section>
  );
}
