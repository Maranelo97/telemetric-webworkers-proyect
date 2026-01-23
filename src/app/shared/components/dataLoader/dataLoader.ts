import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-data-loader',
  imports: [],
  templateUrl: './dataLoader.html',
  styleUrl: './dataLoader.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataLoader {
  isCritical = input<boolean>(false);
}
