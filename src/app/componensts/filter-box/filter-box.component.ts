import { Component, computed, DoCheck, effect, ElementRef, HostListener, Input, OnChanges, signal, Signal, SimpleChanges, ViewChild, WritableSignal } from '@angular/core';
import { CommonModule, getLocaleDateFormat } from '@angular/common';
import { FilterBoxModule } from './components/filter-box.module';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { AccordionComponent } from '../accordion/accordion.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FilterBoxHeaderComponent } from './components/filter-box-header/filter-box-header.component';
import { FormatService } from 'src/app/services/format.service';
import { AsiVamosService } from 'src/app/services/asi-vamos.service';

@Component({
  selector: 'filter-box',
  standalone: true,
  imports: [CommonModule, FilterBoxModule, NgbAccordionModule, AccordionComponent],
  templateUrl: './filter-box.component.html',
  styleUrls: ['./filter-box.component.scss']
})
export class FilterBoxComponent implements DoCheck {

  @Input("signal") sig!: WritableSignal<any>;

  showBox: boolean = false;

  currentDate: Date = new Date();

  data: any;
  initialCoords: number[] = [0, 0];
  activeCoords: number[] = [0, 0];
  endCoords: number[] = [0, 0]

  dragging: boolean = false;

  maintainBoxRef:  any;

  filters: any = [];

  @ViewChild('box', {static: false}) box!: ElementRef;

  constructor(private httpClient: HttpClient, private formatService: FormatService, private asiVamosService: AsiVamosService) {
    this.getData();
    effect(() => {
      this.filters = asiVamosService.filterStatus().filters;
    })
  }

  ngDoCheck(): void {
    if(this.sig?.()) {
      this.showBox = this.sig().open || false;
    }
  }

  getData() {
    const date: string = this.formatService.formatDate(this.currentDate, true, true);
    this.asiVamosService.dataClient.subscribe({
      next: (res) => {
        if(JSON.stringify(res) !== "{}") {
          this.httpClient.get<any>(`https://www.brinsadigital.com.co/asivamos-api/asivamos/${res.Vendedor}/${date}`)
          .subscribe({
            next: (res) => {
              this.data = res;
              this.data.Segmentacion.map((seg: any) => seg.Valores = seg.Valores.map((val: any) => val.Valor));
              this.data.Segmentacion.forEach((seg: any) => {
                seg.Valores.sort()
              })
            }
          })
        }
      }
    })
  }

  close() {
    this.sig?.mutate((currentValue: any) => currentValue.open = false)
  }

  @HostListener('window:mousedown', ['$event'])
  startDrag(event: any) {
    if(event.target.classList.contains("header")) {
      this.dragging = true;
      this.initialCoords[0] = event.screenX;
      this.initialCoords[1] = event.screenY;
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onDrag(event: any) {
    if(this.dragging && this.box) {
      this.activeCoords[0] = this.endCoords[0] + event.screenX - this.initialCoords[0];
      this.activeCoords[1] = this.endCoords[1] + event.screenY - this.initialCoords[1];
      this.box.nativeElement.style.left = this.activeCoords[0] + "px";
      this.box.nativeElement.style.top = this.activeCoords[1] + "px";
    };
  }

  @HostListener('window:mouseup', ['$event'])
  endDrag() {
    this.dragging = false;
    this.endCoords[0] = this.activeCoords[0];
    this.endCoords[1] = this.activeCoords[1];
  }

  changeFilters(categoria: string, campo: string, evento: any) {
    if(evento.target.checked) {
      this.filters.push({categoria, campo});
    }else{
      this.filters = this.filters.filter((flt: any) => {
        if(flt.categoria !== categoria || flt.campo !== campo) {
          return true;
        }else{
          return false;
        }
      });
    }
  }

  isChecked(categ: string, field: string) {
    return this.filters.some((flt: any) => flt.categoria === categ && flt.campo === field);
  }

  toggleCheck(values: string[], categ: string) {
    const reverseFilters: any[] = [];
    values.forEach((field: string) => {
      if(!this.filters.some((flt: any) => flt.categoria === categ && flt.campo === field)) {
        reverseFilters.push({categoria: categ, campo: field})
      }
    })
    this.filters = this.filters.filter((flt: any) => flt.categoria !== categ);
    this.filters.push(...reverseFilters);
  }
}