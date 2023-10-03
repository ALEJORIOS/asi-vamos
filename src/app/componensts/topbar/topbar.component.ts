import { Component, Input, Signal, WritableSignal, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatService } from 'src/app/services/format.service';
import { FilterBoxComponent } from '../filter-box/filter-box.component';
import { AsiVamosService } from 'src/app/services/asi-vamos.service';

@Component({
  selector: 'top-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent {


  constructor(private asiVamosService: AsiVamosService) {

  }

  @Input('date') date!: Date;

  setFilterOpen(open: boolean) {
    this.asiVamosService.filterStatus.mutate((currentValue: any) => currentValue.open = open)
  }
}