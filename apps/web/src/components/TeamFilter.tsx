import type { AlbumSpreadFilterGroups } from "@mundial-album/shared";

type TeamFilterProps = {
  groups: AlbumSpreadFilterGroups;
  selectedTeam: string;
  onSelectTeam: (team: string) => void;
  label?: string;
  placeholder?: string;
};

export function TeamFilter({
  groups,
  selectedTeam,
  onSelectTeam,
  label = "Equipo",
  placeholder = "Seleccionar..."
}: TeamFilterProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={selectedTeam} onChange={(event) => onSelectTeam(event.currentTarget.value)}>
        <option value="">{placeholder}</option>

        {groups.sections.length > 0 ? (
          <optgroup label="Secciones">
            {groups.sections.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </optgroup>
        ) : null}

        <optgroup label="Países">
          {groups.countries.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </optgroup>
      </select>
    </label>
  );
}
