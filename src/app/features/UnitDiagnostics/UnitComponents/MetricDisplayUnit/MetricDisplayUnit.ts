import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-metric-display-unit',
  imports: [],
  templateUrl: './MetricDisplayUnit.html',
  styleUrl: './MetricDisplayUnit.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricDisplayUnit {
  @ViewChild('historyChart') historyChartElement!: ElementRef;
  constructor() {
  }


}
