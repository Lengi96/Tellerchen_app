"use client";

import Link from "next/link";
import { trpc } from "@/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ClipboardList,
  ShoppingCart,
  Clock,
  Plus,
  Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: patients, isLoading: patientsLoading } =
    trpc.patients.list.useQuery({});

  const activePatients = patients?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Willkommens-Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-main">
            {getGreeting()}, {session?.user?.name ?? "Benutzer"}
          </h2>
          <p className="text-muted-foreground">
            Hier ist die Übersicht Ihrer Einrichtung
          </p>
        </div>
        <Link href="/patients">
          <Button className="rounded-xl bg-primary hover:bg-primary-600">
            <Plus className="mr-2 h-4 w-4" />
            Neuen Plan erstellen
          </Button>
        </Link>
      </div>

      {/* Stats-Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktive Patienten
            </CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text-main">
              {patientsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                activePatients
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pläne diese Woche
            </CardTitle>
            <ClipboardList className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text-main">
              {patientsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                patients?.reduce(
                  (count, p) =>
                    count +
                    p.mealPlans.filter(
                      (mp) =>
                        new Date(mp.createdAt).getTime() >
                        Date.now() - 7 * 24 * 60 * 60 * 1000
                    ).length,
                  0
                ) ?? 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Offene Einkaufslisten
            </CardTitle>
            <ShoppingCart className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text-main">—</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Letzte Aktivität
            </CardTitle>
            <Clock className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-text-main">
              {patients && patients.length > 0 && patients[0].mealPlans[0]
                ? new Date(
                    patients[0].mealPlans[0].createdAt
                  ).toLocaleDateString("de-DE")
                : "Keine Aktivität"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Letzte Ernährungspläne */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-text-main">
            Letzte Ernährungspläne
          </CardTitle>
          <CardDescription>
            Die 5 zuletzt erstellten Ernährungspläne
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patientsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !patients || patients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>Noch keine Ernährungspläne erstellt.</p>
              <p className="text-sm mt-1">
                Legen Sie zuerst einen Patienten an, um einen Plan zu erstellen.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Kalenderwoche</TableHead>
                  <TableHead>Kalorien/Woche</TableHead>
                  <TableHead>Erstellt am</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients
                  .flatMap((p) =>
                    p.mealPlans.map((mp) => ({
                      ...mp,
                      pseudonym: p.pseudonym,
                      patientId: p.id,
                    }))
                  )
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .slice(0, 5)
                  .map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">
                        {plan.pseudonym}
                      </TableCell>
                      <TableCell>
                        KW{" "}
                        {getWeekNumber(new Date(plan.weekStart))}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="rounded-xl bg-secondary/20 text-secondary-600"
                        >
                          {plan.totalKcal.toLocaleString("de-DE")} kcal
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(plan.createdAt).toLocaleDateString("de-DE")}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
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
