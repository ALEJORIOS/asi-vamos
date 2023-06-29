import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterBoxHeaderComponent } from './filter-box-header/filter-box-header.component';
import { FilterBoxBodyComponent } from './filter-box-body/filter-box-body.component';
import { FilterBoxFooterComponent } from './filter-box-footer/filter-box-footer.component';

@NgModule({
  declarations: [
    FilterBoxHeaderComponent,
    FilterBoxBodyComponent,
    FilterBoxFooterComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    FilterBoxHeaderComponent,
    FilterBoxBodyComponent,
    FilterBoxFooterComponent
  ]
})
export class FilterBoxModule { }
