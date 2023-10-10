import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent {

  @Input('disable') disable = false;
  constructor() {}

  ngOnInit(): void {
    
  }
}

export class SpinnerMethods {
  loadingState: boolean = false;
  constructor() {}

  public set loading(value: boolean) {
    this.loadingState = value;
  }

  public get loading() {
    return this.loadingState
  }
}