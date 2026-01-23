export type WidgetType = 'KPI' | 'VEHICLE' | 'STATUS' | 'PERFORMANCE';

export interface WidgetConfig {
  label: string;
  value?: string | number;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  colorScheme?: 'indigo' | 'rose' | 'emerald' | 'amber';
}
