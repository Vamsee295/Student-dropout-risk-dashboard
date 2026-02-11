export type FeatureImportanceItem = {
  name: string;
  importance: number;
};

export interface FeatureImportanceProps {
  title?: string;
  subtitle?: string;
  features: FeatureImportanceItem[];
}

export function FeatureImportance({
  title = "Feature Importance",
  subtitle = "Top risk drivers influencing the model.",
  features,
}: FeatureImportanceProps) {
  return (
    <section className="card-surface p-4">
      <h2 className="text-sm font-bold tracking-tight">{title}</h2>
      <p className="mt-1 text-xs font-medium text-neutral-500">{subtitle}</p>
      <div className="mt-4 space-y-3 text-xs font-semibold">
        {features.map((feature) => (
          <div key={feature.name} className="space-y-1">
            <div className="flex items-center justify-between">
              <span>{feature.name}</span>
              <span className="text-neutral-500">
                {feature.importance.toFixed(2)}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-100">
              <div
                className="h-2 rounded-full bg-sky-500"
                style={{ width: `${feature.importance * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

