import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatService } from 'src/app/services/format.service';

@Component({
  selector: 'top-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent {

  constructor() {}

  @Input('date') date!: Date;
}
