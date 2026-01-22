import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetConfig, WidgetType } from '../models/widget.models';
@Component({
  selector: 'widget',
  imports: [],
  templateUrl: './widget.html',
  styleUrl: './widget.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Widget {
  type = input.required<WidgetType>();
  config = input.required<WidgetConfig>();

  containerClasses = () => {
    const base = 'bg-slate-900 shadow-sm hover:bg-slate-800/50 ';
    const colors = {
      indigo: 'border-indigo-500/50 shadow-indigo-500/50',
      rose: 'border-rose-500/50 shadow-rose-500/50',
      emerald: 'border-emerald-500/50 shadow-emerald-500/50',
      amber: 'border-amber-500/50 shadow-amber-500/50',
    };
    return base + colors[this.config().colorScheme || 'indigo'];
  };

  valueClasses = () => {
    const colors = {
      indigo: 'text-indigo-400',
      rose: 'text-rose-500',
      emerald: 'text-emerald-400',
      amber: 'text-amber-500',
    };
    return colors[this.config().colorScheme || 'indigo'];
  };
}
