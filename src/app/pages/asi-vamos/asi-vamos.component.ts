import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-asi-vamos',
  templateUrl: './asi-vamos.component.html',
  styleUrls: ['./asi-vamos.component.scss'],
  imports: [CommonModule]
})
export default class AsiVamosComponent {

  data: any = {
      label: "Así Vamos",
      percentage: 75
    }

}

