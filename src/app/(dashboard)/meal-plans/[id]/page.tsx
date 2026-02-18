"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  ShoppingCart,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";
import type { MealPlanData } from "@/lib/openai/nutritionPrompt";

export default function MealPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;
  const [inlineFeedback, setInlineFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { data: plan, isLoading } = trpc.mealPlans.getById.useQuery({
    id: planId,
  });

  const generateShoppingList =
    trpc.shoppingList.generateFromPlan.useMutation({
      onSuccess: (data) => {
        toast.success("Einkaufsliste erfolgreich erstellt!");
        setInlineFeedback({
          type: "success",
          message: "Einkaufsliste wurde erfolgreich erstellt.",
        });
        router.push(`/shopping-lists/${data.id}`);
      },
      onError: (error) => {
        toast.error(error.message);
        setInlineFeedback({
          type: "error",
          message: error.message || "Einkaufsliste konnte nicht erstellt werden.",
        });
      },
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Ernährungsplan nicht gefunden.</p>
      </div>
    );
  }

  const planData = plan.planJson as unknown as MealPlanData;
  const weekTotalKcal = planData.days.reduce(
    (sum, day) => sum + day.dailyKcal,
    0
  );
  const avgDailyKcal = Math.round(weekTotalKcal / 7);

  return (
    <div className="space-y-6">
      {/* Zurück-Link */}
      <Link
        href={`/patients/${plan.patientId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-text-main"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zum Patienten
      </Link>

      {/* Plan-Header */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-text-main">
                Ernährungsplan – {plan.patient.pseudonym}
              </CardTitle>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                <span>
                  KW {getWeekNumber(new Date(plan.weekStart))} (
                  {new Date(plan.weekStart).toLocaleDateString("de-DE")})
                </span>
                <span>|</span>
                <span>Erstellt von: {plan.createdByUser.name}</span>
                <span>|</span>
                <span>
                  {new Date(plan.createdAt).toLocaleDateString("de-DE")}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setInlineFeedback(null);
                  generateShoppingList.mutate({ mealPlanId: planId });
                }}
                disabled={
                  generateShoppingList.isPending || !!plan.shoppingList
                }
              >
                {generateShoppingList.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingCart className="mr-2 h-4 w-4" />
                )}
                {plan.shoppingList
                  ? "Einkaufsliste vorhanden"
                  : "Einkaufsliste generieren"}
              </Button>
              <PdfExportButton
                plan={planData}
                patientPseudonym={plan.patient.pseudonym}
                weekStart={plan.weekStart.toString()}
                createdBy={plan.createdByUser.name}
                onStatus={setInlineFeedback}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {inlineFeedback && (
            <div
              role="status"
              aria-live={inlineFeedback.type === "error" ? "assertive" : "polite"}
              className={
                inlineFeedback.type === "error"
                  ? "mb-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  : "mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              }
            >
              {inlineFeedback.message}
            </div>
          )}

          <div className="flex gap-4">
            <Badge
              variant="secondary"
              className="rounded-xl bg-secondary/20 text-secondary-600 text-base px-4 py-1"
            >
              {"\u00D8"} {avgDailyKcal} kcal/Tag
            </Badge>
            <Badge
              variant="secondary"
              className="rounded-xl bg-primary/10 text-primary text-base px-4 py-1"
            >
              {weekTotalKcal.toLocaleString("de-DE")} kcal/Woche
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 7-Tage-Grid */}
      <div className="grid gap-4">
        {planData.days.map((day) => (
          <Card key={day.dayName} className="rounded-xl shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-text-main">
                  {day.dayName}
                </CardTitle>
                <Badge className="rounded-xl bg-primary text-white">
                  {day.dailyKcal} kcal
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {day.meals.map((meal, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border p-3 hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-primary uppercase">
                        {meal.mealType}
                      </span>
                      <Badge
                        variant="outline"
                        className="rounded-xl text-xs"
                      >
                        {meal.kcal} kcal
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm text-text-main">
                      {meal.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {meal.description}
                    </p>
                    <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                      <span>P: {meal.protein}g</span>
                      <span>K: {meal.carbs}g</span>
                      <span>F: {meal.fat}g</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Shopping List Link */}
      {plan.shoppingList && (
        <div className="text-center">
          <Link href={`/shopping-lists/${plan.shoppingList.id}`}>
            <Button variant="outline" className="rounded-xl">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Zur Einkaufsliste
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

// PDF-Export-Button Komponente (Client-only wegen @react-pdf/renderer)
function PdfExportButton({
  plan,
  patientPseudonym,
  weekStart,
  createdBy,
  onStatus,
}: {
  plan: MealPlanData;
  patientPseudonym: string;
  weekStart: string;
  createdBy: string;
  onStatus: (status: { type: "success" | "error"; message: string } | null) => void;
}) {
  // Da PDFDownloadLink und MealPlanPdfDocument dynamisch geladen werden,
  // verwenden wir einen einfachen Download-Ansatz
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePdfExport = async () => {
    setIsGenerating(true);
    onStatus(null);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { MealPlanPdfDocument } = await import("@/lib/pdf/mealPlanPdf");

      const blob = await pdf(
        <MealPlanPdfDocument
          plan={plan}
          patientPseudonym={patientPseudonym}
          weekStart={weekStart}
          createdBy={createdBy}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ernaehrungsplan-${patientPseudonym}-${weekStart}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF erfolgreich erstellt!");
      onStatus({
        type: "success",
        message: "PDF wurde erfolgreich erstellt.",
      });
    } catch {
      toast.error("Fehler beim Erstellen des PDFs.");
      onStatus({
        type: "error",
        message: "PDF konnte nicht erstellt werden.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="rounded-xl"
      onClick={handlePdfExport}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="mr-2 h-4 w-4" />
      )}
      Als PDF exportieren
    </Button>
  );
}

function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
