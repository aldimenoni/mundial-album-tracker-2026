export type TeamTheme = {
  flagCode: string;
  primary: string;
  secondary: string;
  accent: string;
};

export type SpreadVisualTheme = {
  flagCode?: string;
  primary: string;
  secondary: string;
  accent: string;
  badgeSrc?: string;
  label: string;
};

const TEAM_THEMES: Record<string, TeamTheme> = {
  Mexico: { flagCode: "mx", primary: "#006847", secondary: "#004b35", accent: "#ce1126" },
  Sudafrica: { flagCode: "za", primary: "#007749", secondary: "#005a38", accent: "#ffb612" },
  "Corea del Sur": { flagCode: "kr", primary: "#003478", secondary: "#00285c", accent: "#c60c30" },
  Chequia: { flagCode: "cz", primary: "#11457e", secondary: "#0d3561", accent: "#d7141a" },
  Canada: { flagCode: "ca", primary: "#d80621", secondary: "#a80419", accent: "#ffffff" },
  Suiza: { flagCode: "ch", primary: "#d52b1e", secondary: "#a82117", accent: "#ffffff" },
  Qatar: { flagCode: "qa", primary: "#8a1538", secondary: "#6d1130", accent: "#ffffff" },
  "Bosnia y Herzegovina": { flagCode: "ba", primary: "#002395", secondary: "#001a6d", accent: "#fecb00" },
  Brasil: { flagCode: "br", primary: "#009c3b", secondary: "#00752d", accent: "#ffdf00" },
  Marruecos: { flagCode: "ma", primary: "#c1272d", secondary: "#961e23", accent: "#006233" },
  Escocia: { flagCode: "gb-sct", primary: "#005eb8", secondary: "#00478f", accent: "#ffffff" },
  Haiti: { flagCode: "ht", primary: "#00209f", secondary: "#001878", accent: "#d21034" },
  "Estados Unidos": { flagCode: "us", primary: "#3c3b6e", secondary: "#2b2a50", accent: "#b22234" },
  Paraguay: { flagCode: "py", primary: "#0038a8", secondary: "#002a7d", accent: "#d52b1e" },
  Australia: { flagCode: "au", primary: "#012169", secondary: "#00184f", accent: "#e4002b" },
  Turquia: { flagCode: "tr", primary: "#e30a17", secondary: "#b00812", accent: "#ffffff" },
  Alemania: { flagCode: "de", primary: "#000000", secondary: "#1a1a1a", accent: "#dd0000" },
  Curazao: { flagCode: "cw", primary: "#002b7f", secondary: "#001f5c", accent: "#f7d117" },
  "Costa de Marfil": { flagCode: "ci", primary: "#f77f00", secondary: "#c56500", accent: "#009e60" },
  Ecuador: { flagCode: "ec", primary: "#ffd100", secondary: "#ccaa00", accent: "#034ea2" },
  "Paises Bajos": { flagCode: "nl", primary: "#ff6600", secondary: "#cc5200", accent: "#21468b" },
  Japon: { flagCode: "jp", primary: "#bc002d", secondary: "#960024", accent: "#ffffff" },
  Suecia: { flagCode: "se", primary: "#006aa7", secondary: "#005283", accent: "#fecc00" },
  Tunez: { flagCode: "tn", primary: "#e70013", secondary: "#b8000f", accent: "#ffffff" },
  Belgica: { flagCode: "be", primary: "#ef3340", secondary: "#be2833", accent: "#ffd90c" },
  Egipto: { flagCode: "eg", primary: "#ce1126", secondary: "#a30d1e", accent: "#000000" },
  Iran: { flagCode: "ir", primary: "#239f40", secondary: "#1b7d32", accent: "#da0000" },
  "Nueva Zelanda": { flagCode: "nz", primary: "#012169", secondary: "#00184f", accent: "#c8102e" },
  España: { flagCode: "es", primary: "#c60b1e", secondary: "#9e0918", accent: "#ffc400" },
  "Cabo Verde": { flagCode: "cv", primary: "#003893", secondary: "#002b6f", accent: "#cf2027" },
  "Arabia Saudita": { flagCode: "sa", primary: "#006c35", secondary: "#005429", accent: "#ffffff" },
  Uruguay: { flagCode: "uy", primary: "#0038a8", secondary: "#002a7d", accent: "#ffffff" },
  Francia: { flagCode: "fr", primary: "#0055a4", secondary: "#004283", accent: "#ef4135" },
  Senegal: { flagCode: "sn", primary: "#00853f", secondary: "#006831", accent: "#fdcb00" },
  Irak: { flagCode: "iq", primary: "#ce1126", secondary: "#a30d1e", accent: "#007a3d" },
  Noruega: { flagCode: "no", primary: "#ba0c2f", secondary: "#930a25", accent: "#00205b" },
  Argentina: { flagCode: "ar", primary: "#74acdf", secondary: "#5c89b2", accent: "#ffffff" },
  Argelia: { flagCode: "dz", primary: "#006233", secondary: "#004d28", accent: "#d21034" },
  Austria: { flagCode: "at", primary: "#ed2939", secondary: "#be2130", accent: "#ffffff" },
  Jordania: { flagCode: "jo", primary: "#007a3d", secondary: "#005f30", accent: "#000000" },
  Portugal: { flagCode: "pt", primary: "#006600", secondary: "#004f00", accent: "#ff0000" },
  "RD Congo": { flagCode: "cd", primary: "#007fff", secondary: "#0066cc", accent: "#f7d618" },
  Uzbekistan: { flagCode: "uz", primary: "#1eb53a", secondary: "#178f2e", accent: "#0099b5" },
  Colombia: { flagCode: "co", primary: "#fcd116", secondary: "#caa711", accent: "#003893" },
  Inglaterra: { flagCode: "gb-eng", primary: "#cf081f", secondary: "#a10618", accent: "#ffffff" },
  Croacia: { flagCode: "hr", primary: "#171796", secondary: "#121275", accent: "#ff0000" },
  Ghana: { flagCode: "gh", primary: "#006b3f", secondary: "#005231", accent: "#fcd116" },
  Panama: { flagCode: "pa", primary: "#005293", secondary: "#004074", accent: "#d21034" }
};

export type TeamDisplayLabel = {
  spanish: string;
  english: string;
};

// Nombres del header de cada selección según el álbum Panini FIFA World Cup 2026.
// Español: edición LATAM / nombres del álbum en español.
// Inglés: títulos oficiales de la checklist Panini (secciones de 20 figuritas).
const TEAM_DISPLAY_LABELS: Record<string, TeamDisplayLabel> = {
  Mexico: { spanish: "Mexico", english: "Mexico" },
  Sudafrica: { spanish: "Sudafrica", english: "South Africa" },
  "Corea del Sur": { spanish: "Corea del Sur", english: "Korea Republic" },
  Chequia: { spanish: "Chequia", english: "Czechia" },
  Canada: { spanish: "Canada", english: "Canada" },
  "Bosnia y Herzegovina": {
    spanish: "Bosnia y Herzegovina",
    english: "Bosnia and Herzegovina"
  },
  Qatar: { spanish: "Qatar", english: "Qatar" },
  Suiza: { spanish: "Suiza", english: "Switzerland" },
  Brasil: { spanish: "Brasil", english: "Brazil" },
  Marruecos: { spanish: "Marruecos", english: "Morocco" },
  Haiti: { spanish: "Haiti", english: "Haiti" },
  Escocia: { spanish: "Escocia", english: "Scotland" },
  "Estados Unidos": { spanish: "Estados Unidos", english: "United States" },
  Paraguay: { spanish: "Paraguay", english: "Paraguay" },
  Australia: { spanish: "Australia", english: "Australia" },
  Turquia: { spanish: "Turquia", english: "Türkiye" },
  Alemania: { spanish: "Alemania", english: "Germany" },
  Curazao: { spanish: "Curazao", english: "Curaçao" },
  "Costa de Marfil": { spanish: "Costa de Marfil", english: "Côte d'Ivoire" },
  Ecuador: { spanish: "Ecuador", english: "Ecuador" },
  "Paises Bajos": { spanish: "Paises Bajos", english: "Netherlands" },
  Japon: { spanish: "Japon", english: "Japan" },
  Suecia: { spanish: "Suecia", english: "Sweden" },
  Tunez: { spanish: "Tunez", english: "Tunisia" },
  Belgica: { spanish: "Belgica", english: "Belgium" },
  Egipto: { spanish: "Egipto", english: "Egypt" },
  Iran: { spanish: "Iran", english: "Iran" },
  "Nueva Zelanda": { spanish: "Nueva Zelanda", english: "New Zealand" },
  España: { spanish: "España", english: "Spain" },
  "Cabo Verde": { spanish: "Cabo Verde", english: "Cabo Verde" },
  "Arabia Saudita": { spanish: "Arabia Saudita", english: "Saudi Arabia" },
  Uruguay: { spanish: "Uruguay", english: "Uruguay" },
  Francia: { spanish: "Francia", english: "France" },
  Senegal: { spanish: "Senegal", english: "Senegal" },
  Irak: { spanish: "Irak", english: "Iraq" },
  Noruega: { spanish: "Noruega", english: "Norway" },
  Argentina: { spanish: "Argentina", english: "Argentina" },
  Argelia: { spanish: "Argelia", english: "Algeria" },
  Austria: { spanish: "Austria", english: "Austria" },
  Jordania: { spanish: "Jordania", english: "Jordan" },
  Portugal: { spanish: "Portugal", english: "Portugal" },
  "RD Congo": { spanish: "RD Congo", english: "Congo DR" },
  Uzbekistan: { spanish: "Uzbekistan", english: "Uzbekistan" },
  Colombia: { spanish: "Colombia", english: "Colombia" },
  Inglaterra: { spanish: "Inglaterra", english: "England" },
  Croacia: { spanish: "Croacia", english: "Croatia" },
  Ghana: { spanish: "Ghana", english: "Ghana" },
  Panama: { spanish: "Panama", english: "Panama" }
};

const INTRO_THEME: SpreadVisualTheme = {
  primary: "#0b1f4b",
  secondary: "#163a8a",
  accent: "#d4af37",
  badgeSrc: "/brand/world-cup-2026.svg",
  label: "Panini y seccion FWC del album oficial"
};

const COCA_COLA_THEME: SpreadVisualTheme = {
  primary: "#b30000",
  secondary: "#8f0000",
  accent: "#ffffff",
  badgeSrc: "/brand/coca-cola-mark.svg",
  label: "Coca-Cola"
};

export function getTeamTheme(team: string): TeamTheme | null {
  return TEAM_THEMES[team] ?? null;
}

export function getTeamDisplayLabel(team: string): TeamDisplayLabel {
  return TEAM_DISPLAY_LABELS[team] ?? { spanish: team, english: team };
}

export function getSpreadVisualTheme(input: {
  id: string;
  title: string;
  team?: string;
}): SpreadVisualTheme {
  if (input.id.startsWith("historia")) {
    return INTRO_THEME;
  }

  if (input.id === "coca-cola") {
    return COCA_COLA_THEME;
  }

  if (input.team) {
    const teamTheme = getTeamTheme(input.team);

    if (teamTheme) {
      return {
        flagCode: teamTheme.flagCode,
        primary: teamTheme.primary,
        secondary: teamTheme.secondary,
        accent: teamTheme.accent,
        label: input.title
      };
    }
  }

  return {
    primary: "#0b1f4b",
    secondary: "#163a8a",
    accent: "#ffffff",
    label: input.title
  };
}

export function getFlagSrc(flagCode: string): string {
  return `/flags/${flagCode}.svg`;
}
