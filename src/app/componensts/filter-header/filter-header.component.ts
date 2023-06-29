import { Component, effect, Input, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'filter-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-header.component.html',
  styleUrls: ['./filter-header.component.scss']
})
export class FilterHeaderComponent {

  @Input("signal") sig: any;

  doSomething() {
    this.sig.mutate((currentValue: any) => currentValue.open = true)
  }

  constructor() {

  }
}
