import {
  LucideIcon,
  Car,
  Eye,
  Star,
  Shield,
  MapPin,
  Compass,
  Moon,
  Zap,
} from "lucide-react";

export type Stop = {
  id: string;
  driverId?: string;
  occurredAt?: string;
  lat: number;
  lng: number;
  label: string;
  note?: string;
};

export type AchievementContext = {
  stops: Stop[];
  daysDriving: number;
};

export type AchievementDefinition = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  check: (context: AchievementContext) => boolean;
};

const diffDays = (a: Date, b: Date) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((b.getTime() - a.getTime()) / msPerDay);
};

const achievements: AchievementDefinition[] = [
  {
    id: "FIRST_CONTACT",
    title: "Prvý kontakt",
    description: "Oficiálne si si všimli.",
    icon: Car,
    check: (context) => context.stops.length >= 1,
  },
  {
    id: "KNOWN_FACE",
    title: "Známa tvár",
    description: "Možno ťa už poznajú podľa auta.",
    icon: Eye,
    check: (context) => context.stops.length >= 3,
  },
  {
    id: "LOCAL_LEGEND",
    title: "Lokálna legenda",
    description: "Vernostná karta sa pripravuje.",
    icon: Star,
    check: (context) => context.stops.length >= 5,
  },
  {
    id: "CLEAN_WEEK",
    title: "Čistý týždeň",
    description: "Nikto si ťa nevšimol.",
    icon: Shield,
    check: (context) => {
      const now = new Date();
      const sortedByDate = context.stops
        .filter((s) => s.occurredAt)
        .sort(
          (a, b) =>
            new Date(a.occurredAt!).getTime() -
            new Date(b.occurredAt!).getTime(),
        );
      const mostRecent = sortedByDate[sortedByDate.length - 1];
      if (!mostRecent) return false;
      const daysSince = diffDays(new Date(mostRecent.occurredAt!), now);
      return daysSince >= 7;
    },
  },
  {
    id: "CITY_CLASSIC",
    title: "Mestský klasik",
    description: "Toto mesto ťa má rado.",
    icon: MapPin,
    check: (context) => {
      const labelCounts: Record<string, number> = {};
      context.stops.forEach((s) => {
        labelCounts[s.label] = (labelCounts[s.label] || 0) + 1;
      });
      return Object.values(labelCounts).some((c) => c >= 2);
    },
  },
  {
    id: "TRAVELER",
    title: "Cestovateľ",
    description: "Turné pokračuje.",
    icon: Compass,
    check: (context) => {
      const labels = new Set(context.stops.map((s) => s.label));
      return labels.size >= 3;
    },
  },
  {
    id: "NIGHT_DRIVER",
    title: "Nočný jazdec",
    description: "Mesiac bol svedkom.",
    icon: Moon,
    check: (context) => {
      return context.stops.some((s) => {
        if (!s.occurredAt) return false;
        const hour = new Date(s.occurredAt).getHours();
        return hour >= 22;
      });
    },
  },
  {
    id: "WILD_WEEK",
    title: "Divoký týždeň",
    description: "Vesmír mal iné plány.",
    icon: Zap,
    check: (context) => {
      const sortedByDate = context.stops
        .filter((s) => s.occurredAt)
        .sort(
          (a, b) =>
            new Date(a.occurredAt!).getTime() -
            new Date(b.occurredAt!).getTime(),
        );
      if (sortedByDate.length < 2) return false;
      for (let i = 1; i < sortedByDate.length; i++) {
        const prev = new Date(sortedByDate[i - 1].occurredAt!);
        const curr = new Date(sortedByDate[i].occurredAt!);
        if (diffDays(prev, curr) <= 7) return true;
      }
      return false;
    },
  },
];

export function getAchievements(context: AchievementContext) {
  return achievements.map((definition) => ({
    definition,
    unlocked: definition.check(context),
  }));
}
