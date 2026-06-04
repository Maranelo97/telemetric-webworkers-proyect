import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-data-loader',
  imports: [],
  templateUrl: './data-loader.html',
  styleUrl: './data-loader.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataLoader {
  isCritical = input<boolean>(false);
}
