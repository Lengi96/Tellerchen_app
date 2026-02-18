"use client";

import Link from "next/link";
import { trpc } from "@/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ShoppingCart } from "lucide-react";

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export default function ShoppingListsPage() {
  const {
    data: lists,
    isLoading,
    error,
    refetch,
  } = trpc.shoppingList.list.useQuery(
    { limit: 50 },
    {
      retry: 1,
    }
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-main">Einkaufslisten</h2>
        <p className="text-muted-foreground">
          Übersicht aller generierten Einkaufslisten Ihrer Einrichtung
        </p>
      </div>

      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-text-main">Alle Einkaufslisten</CardTitle>
          <CardDescription>
            Sortiert nach Erstellungsdatum (neueste zuerst)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="font-medium text-text-main">Einkaufslisten konnten nicht geladen werden.</p>
              <p className="text-sm mt-1">{error.message}</p>
              <Button variant="outline" className="mt-4 rounded-xl" onClick={() => refetch()}>
                Erneut versuchen
              </Button>
            </div>
          ) : !lists || lists.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>Noch keine Einkaufslisten vorhanden.</p>
              <p className="text-sm mt-1">
                Erstellen Sie zuerst einen Ernährungsplan und daraus eine Einkaufsliste.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Kalenderwoche</TableHead>
                  <TableHead>Erstellt von</TableHead>
                  <TableHead>Erstellt am</TableHead>
                  <TableHead>Aktion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lists.map((list) => (
                  <TableRow key={list.id}>
                    <TableCell className="font-medium">
                      <Link className="hover:underline" href={`/patients/${list.mealPlan.patient.id}`}>
                        {list.mealPlan.patient.pseudonym}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-xl bg-secondary/20 text-secondary-600">
                        KW {getWeekNumber(new Date(list.mealPlan.weekStart))}
                      </Badge>
                    </TableCell>
                    <TableCell>{list.mealPlan.createdByUser.name}</TableCell>
                    <TableCell>{new Date(list.createdAt).toLocaleDateString("de-DE")}</TableCell>
                    <TableCell>
                      <Link href={`/shopping-lists/${list.id}`}>
                        <Button variant="outline" size="sm" className="rounded-xl">
                          Öffnen
                        </Button>
                      </Link>
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
