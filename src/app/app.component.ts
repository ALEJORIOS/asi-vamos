import { Component, effect } from '@angular/core';
import { AsiVamosService } from './services/asi-vamos.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'asi_vamos';

  constructor(public asiVamosService: AsiVamosService) {
    effect(() => {
      console.log("SeñalApp: ", asiVamosService.filterStatus());
    })
  }
}