import type { ReactNode } from "react";

export type TrendType = "positive" | "negative" | "neutral";

export interface KpiCardProps {
  title: string;
  value: string;
  helperText?: string;
  trendLabel?: string;
  trendType?: TrendType;
  icon?: ReactNode;
}

const trendColorByType: Record<TrendType, string> = {
  positive: "text-emerald-600",
  negative: "text-red-500",
  neutral: "text-neutral-500",
};

export function KpiCard({
  title,
  value,
  helperText,
  trendLabel,
  trendType = "neutral",
  icon,
}: KpiCardProps) {
  return (
    <section className="card-surface flex items-start justify-between p-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
          {title}
        </p>
        <div className="mt-2 text-2xl font-bold">{value}</div>
        {helperText ? (
          <p className="mt-1 text-[11px] font-medium text-neutral-500">
            {helperText}
          </p>
        ) : null}
        {trendLabel ? (
          <p
            className={[
              "mt-1 text-[11px] font-semibold",
              trendColorByType[trendType],
            ].join(" ")}
          >
            {trendLabel}
          </p>
        ) : null}
      </div>
      {icon ? (
        <div className="ml-3 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
          {icon}
        </div>
      ) : null}
    </section>
  );
}

