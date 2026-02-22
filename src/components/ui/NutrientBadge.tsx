/**
 * Konsistente Nährwert-Badge Komponente.
 * WICHTIG: Kein Rot für Nährwerte – im Kontext von Essstörungen
 * ist Rot eine problematische Signalfarbe (Schuld/Gefahr).
 */
import { Beef, Wheat, Droplets, Flame } from "lucide-react";

type NutrientType = "kcal" | "protein" | "carbs" | "fat";

const NUTRIENT_CONFIG: Record<
  NutrientType,
  {
    bg: string;
    text: string;
    border: string;
    label: string;
    icon: React.ElementType;
  }
> = {
  kcal: {
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
    label: "kcal",
    icon: Flame,
  },
  protein: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    label: "g Protein",
    icon: Beef,
  },
  carbs: {
    bg: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-200",
    label: "g KH",
    icon: Wheat,
  },
  fat: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    label: "g Fett",
    icon: Droplets,
  },
};

interface NutrientBadgeProps {
  type: NutrientType;
  value: number;
  /** Kompakte Darstellung ohne Hintergrund (für Tabellen) */
  compact?: boolean;
  /** Zeigt nur Icon + Wert ohne Label */
  iconOnly?: boolean;
}

export function NutrientBadge({
  type,
  value,
  compact = false,
  iconOnly = false,
}: NutrientBadgeProps) {
  const config = NUTRIENT_CONFIG[type];
  const Icon = config.icon;

  if (compact) {
    return (
      <span className={`flex items-center gap-1 text-xs ${config.text}`}>
        <Icon className="h-3 w-3" />
        {value.toLocaleString("de-DE")}
        {!iconOnly && ` ${config.label}`}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {value.toLocaleString("de-DE")} {config.label}
    </span>
  );
}
