type TeamFilterProps = {
  teams: string[];
  selectedTeam: string;
  onSelectTeam: (team: string) => void;
};

export function TeamFilter({ teams, selectedTeam, onSelectTeam }: TeamFilterProps) {
  return (
    <label className="field">
      <span>Equipo</span>
      <select value={selectedTeam} onChange={(event) => onSelectTeam(event.currentTarget.value)}>
        {teams.map((team) => (
          <option key={team} value={team}>
            {team}
          </option>
        ))}
      </select>
    </label>
  );
}
