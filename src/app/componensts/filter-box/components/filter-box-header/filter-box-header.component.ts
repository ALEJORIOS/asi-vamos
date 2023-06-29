import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'filter-box-header',
  standalone: false,
  templateUrl: './filter-box-header.component.html',
  styleUrls: ['./filter-box-header.component.scss']
})
export class FilterBoxHeaderComponent {

  @Output() closeEmitter = new EventEmitter<string>();

  close() {
    this.closeEmitter.emit("");
  }
}
