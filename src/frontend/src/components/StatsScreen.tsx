import { Skeleton } from "@/components/ui/skeleton";
import { BarChart2, Bell, Target } from "lucide-react";
import { useGetStats } from "../hooks/useQueries";

export function StatsScreen() {
  const { data: stats, isLoading } = useGetStats();

  const totalDismissed = stats ? Number(stats[0]) : 0;
  const avgAttempts = stats ? stats[1].toFixed(2) : "0.00";

  return (
    <div className="space-y-6" data-ocid="stats.section">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold text-foreground">Your Stats</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Track your alarm dismissal performance
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4" data-ocid="stats.loading_state">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <div className="glass-card rounded-2xl p-6 flex items-center gap-5">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/20">
              <Bell className="w-7 h-7 text-teal" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">
                Total Alarms Dismissed
              </p>
              <p className="text-4xl font-bold text-foreground mt-1">
                {totalDismissed}
              </p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 flex items-center gap-5">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/20">
              <Target className="w-7 h-7 text-blue-accent" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">
                Avg. Attempts to Dismiss
              </p>
              <p className="text-4xl font-bold text-foreground mt-1">
                {avgAttempts}
              </p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 flex items-center gap-5">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-orange/20">
              <BarChart2 className="w-7 h-7 text-orange" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Performance Score</p>
              <p className="text-4xl font-bold text-foreground mt-1">
                {totalDismissed === 0
                  ? "—"
                  : Math.max(
                      0,
                      100 - Math.round((Number(avgAttempts) - 1) * 20),
                    )}
                {totalDismissed > 0 && (
                  <span className="text-base text-muted-foreground">/100</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-semibold text-foreground mb-3">
          Tips for Better Performance
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-teal">→</span> Review formulas before sleeping
          </li>
          <li className="flex gap-2">
            <span className="text-teal">→</span> Set alarms for weaker subjects
          </li>
          <li className="flex gap-2">
            <span className="text-teal">→</span> Use Mixed mode for variety
          </li>
          <li className="flex gap-2">
            <span className="text-teal">→</span> Aim to answer on first attempt
          </li>
        </ul>
      </div>
    </div>
  );
}
