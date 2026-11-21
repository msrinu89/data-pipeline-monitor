export type Status = "Successful" | "Failed" | "Running" | "Pending";
export type Platform = "Databricks" | "Azure Data Factory" | "Snowflake";
export type Environment = "Production" | "Staging" | "Development";
export interface Pipeline {
  id: string;
  name: string;
  description: string;
  platform: Platform;
  application: string;
  status: Status;
  duration: number;
  schedule: string;
}
export interface Run {
  id: string;
  pipelineId: string;
  status: Status;
  startedAt: string;
  duration: number;
}
export const referenceTime = new Date();
export const pipelines: Pipeline[] = [
  {
    id: "1001",
    name: "customer_360_daily",
    description: "Unified customer profiles",
    platform: "Databricks",
    application: "Customer Intelligence",
    status: "Failed",
    duration: 842,
    schedule: "Every day at 06:00",
  },
  {
    id: "1002",
    name: "sales_orders_ingestion",
    description: "Commerce orders to bronze",
    platform: "Azure Data Factory",
    application: "Commerce",
    status: "Running",
    duration: 325,
    schedule: "Every 30 minutes",
  },
  {
    id: "1003",
    name: "finance_revenue_rollup",
    description: "Daily revenue reconciliation",
    platform: "Snowflake",
    application: "Finance",
    status: "Successful",
    duration: 194,
    schedule: "Every day at 07:00",
  },
  {
    id: "1004",
    name: "product_catalog_sync",
    description: "Product catalog enrichment",
    platform: "Databricks",
    application: "Commerce",
    status: "Successful",
    duration: 428,
    schedule: "Every hour",
  },
  {
    id: "1005",
    name: "inventory_snapshot",
    description: "Warehouse stock availability",
    platform: "Azure Data Factory",
    application: "Supply Chain",
    status: "Successful",
    duration: 156,
    schedule: "Every 2 hours",
  },
  {
    id: "1006",
    name: "marketing_attribution",
    description: "Campaign conversion modeling",
    platform: "Databricks",
    application: "Customer Intelligence",
    status: "Running",
    duration: 611,
    schedule: "Every 4 hours",
  },
  {
    id: "1007",
    name: "supplier_quality_checks",
    description: "Supplier data quality validation",
    platform: "Snowflake",
    application: "Supply Chain",
    status: "Failed",
    duration: 87,
    schedule: "Every day at 08:00",
  },
  {
    id: "1008",
    name: "payments_settlement",
    description: "Payment ledger reconciliation",
    platform: "Databricks",
    application: "Finance",
    status: "Successful",
    duration: 332,
    schedule: "Every day at 09:00",
  },
  {
    id: "1009",
    name: "web_events_stream",
    description: "Session and interaction events",
    platform: "Databricks",
    application: "Customer Intelligence",
    status: "Successful",
    duration: 204,
    schedule: "Every 15 minutes",
  },
  {
    id: "1010",
    name: "customer_segments",
    description: "Audience segmentation refresh",
    platform: "Snowflake",
    application: "Customer Intelligence",
    status: "Pending",
    duration: 0,
    schedule: "Every day at 12:00",
  },
  {
    id: "1011",
    name: "shipment_tracking",
    description: "Carrier delivery updates",
    platform: "Azure Data Factory",
    application: "Supply Chain",
    status: "Successful",
    duration: 276,
    schedule: "Every hour",
  },
  {
    id: "1012",
    name: "daily_business_metrics",
    description: "Executive reporting aggregates",
    platform: "Snowflake",
    application: "Finance",
    status: "Successful",
    duration: 518,
    schedule: "Every day at 10:00",
  },
];
export function getPipelines(environment: Environment): Pipeline[] {
  if (environment === "Production") return pipelines;
  return pipelines.slice(0, environment === "Staging" ? 8 : 5).map((p, i) => ({
    ...p,
    status:
      i === 1
        ? "Running"
        : i === 3 && environment === "Development"
          ? "Failed"
          : "Successful",
  }));
}
export function getRuns(items: Pipeline[]): Run[] {
  return items.flatMap((p, i) =>
    Array.from({ length: 30 }, (_, day) => ({
      id: `${p.id}-${day + 1}`,
      pipelineId: p.id,
      status:
        day === 0
          ? p.status
          : (day * 7 + i * 3) % 23 === 0
            ? "Failed"
            : "Successful",
      startedAt: new Date(
        referenceTime.getTime() - day * 86400000 - (i * 7 + 3) * 60000,
      ).toISOString(),
      duration: day === 0 ? p.duration : 180 + ((i * 43 + day * 17) % 720),
    })),
  ) as Run[];
}
export function duration(seconds: number) {
  return seconds
    ? `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`
    : "—";
}
