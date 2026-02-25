"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Loader2,
} from "lucide-react";
import { trpc } from "@/trpc/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BillingSuccessPage() {
  const router = useRouter();
  const subscriptionQuery = trpc.billing.getSubscription.useQuery(undefined, {
    refetchInterval: (query) => {
      const status = query.state.data?.subscriptionStatus;
      return status === "ACTIVE" ? false : 2000;
    },
    refetchOnWindowFocus: true,
  });

  const subscriptionStatus = subscriptionQuery.data?.subscriptionStatus;
  const isActive = subscriptionStatus === "ACTIVE";
  const isPolling = !subscriptionQuery.isError && (subscriptionQuery.isLoading || subscriptionQuery.isFetching);
  const showDelayedStatus = !subscriptionQuery.isError && !isActive && !!subscriptionStatus;

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(isActive ? "/dashboard" : "/billing");
    }, isActive ? 6000 : 12000);

    return () => clearTimeout(timer);
  }, [isActive, router]);

  return (
    <div className="flex items-center justify-center py-16">
      <Card className="max-w-md w-full rounded-xl shadow-lg">
        <CardContent className="flex flex-col items-center space-y-6 p-8 text-center">
          {isActive ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          ) : subscriptionQuery.isError ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <AlertCircle className="h-10 w-10 text-amber-600" />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              {isPolling ? (
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              ) : (
                <Clock3 className="h-10 w-10 text-blue-600" />
              )}
            </div>
          )}

          <div className="space-y-2">
            {isActive ? (
              <>
                <h2 className="text-2xl font-bold text-text-main">
                  Zahlung bestätigt
                </h2>
                <p className="text-muted-foreground">
                  Ihr Abonnement ist aktiv. Sie können mein-nutrikompass.de jetzt
                  ohne Einschränkungen nutzen.
                </p>
              </>
            ) : subscriptionQuery.isError ? (
              <>
                <h2 className="text-2xl font-bold text-text-main">
                  Zahlung eingegangen
                </h2>
                <p className="text-muted-foreground">
                  Wir konnten den Aktivierungsstatus gerade nicht prüfen. Bitte
                  öffnen Sie die Abo-Details oder warten Sie einen Moment.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-text-main">
                  Zahlung eingegangen
                </h2>
                <p className="text-muted-foreground">
                  Ihr Abonnement wird gerade serverseitig bestätigt. Das kann
                  wenige Sekunden dauern.
                </p>
              </>
            )}
          </div>

          {showDelayedStatus ? (
            <p className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
              Status aktuell: {subscriptionStatus}. Wir prüfen weiter automatisch.
            </p>
          ) : null}

          <div className="flex w-full flex-col gap-3">
            <Link href="/dashboard">
              <Button className="w-full rounded-xl">
                Zum Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/billing">
              <Button variant="outline" className="w-full rounded-xl">
                Abo-Details ansehen
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            {isActive
              ? "Sie werden in wenigen Sekunden zum Dashboard weitergeleitet."
              : "Sie werden in wenigen Sekunden zur Abo-Übersicht weitergeleitet."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

