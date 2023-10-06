import { Component, Input, WritableSignal } from '@angular/core';

@Component({
  selector: 'filter-box-footer',
  standalone: false,
  templateUrl: './filter-box-footer.component.html',
  styleUrls: ['./filter-box-footer.component.scss']
})
export class FilterBoxFooterComponent {

  @Input("Signal") sig!: WritableSignal<any>;
  @Input("Filters") filters: any = [];
  apply() {
    
    this.sig?.mutate(state => state.filters = this.filters);
    this.sig?.mutate(state => state.update = true);
    this.sig?.mutate((currentValue: any) => currentValue.open = false);
  }

}
