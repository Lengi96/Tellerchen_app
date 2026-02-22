"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AutonomyAgreementData {
  canPortionSupervised: boolean;
  canPortionIndependent: boolean;
}

interface AutonomyBadgeProps {
  agreement?: AutonomyAgreementData | null;
}

export function AutonomyBadge({ agreement }: AutonomyBadgeProps) {
  if (!agreement) {
    return (
      <Badge
        variant="secondary"
        className="rounded-xl bg-gray-100 text-gray-500 text-xs"
      >
        Keine Absprachen
      </Badge>
    );
  }

  if (agreement.canPortionIndependent) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge className="rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">
              Eigenständig
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Darf vollständig eigenständig portionieren</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (agreement.canPortionSupervised) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge className="rounded-xl bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">
              Unter Aufsicht
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Darf unter Aufsicht portionieren</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="rounded-xl bg-gray-100 text-gray-500 text-xs"
    >
      Keine Absprachen
    </Badge>
  );
}
