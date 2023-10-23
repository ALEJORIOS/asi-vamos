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

  currentBox: string | null = null;

  dragging: boolean = false;

  maintainBoxRef:  any;

  filters: any = [];

  newDirector: number = 0;

  temporalDirector: string = "";

  temporalFilters: any = {};

  omitInit: boolean = false;

  tiny: boolean = false;

  disableAll: boolean = false;

  @ViewChild('box', {static: false}) box!: ElementRef;

  constructor(private httpClient: HttpClient, private formatService: FormatService, public asiVamosService: AsiVamosService) {
    if(window.screen.width < 768) {
      this.tiny = true;
    }else {
      this.tiny = false;
    }
    this.getData();
    asiVamosService.removeFilters.subscribe({
      next: (res: boolean) => {
        if(res) {
          this.removeFilters();
        }
      }
    })
    effect(() => {
      if(!this.omitInit) {
        this.filters = asiVamosService.filterStatus().filters;
      }else{
        this.omitInit = false;
      }
      this.temporalDirector = asiVamosService.allDirectors().current;
    })
  }

  removeFilters() {
    this.temporalFilters = {};
    this.asiVamosService.removeFilters.next(false);
    this.asiVamosService.filterStatus.mutate((sts: any) => sts.filters = []);
    this.getData();
  }

  ngDoCheck(): void {
    if(this.sig?.()) {
      this.showBox = this.sig().open || false;
    }
  }

  order: any = {
    UEN: 0,
    Vendedor: 1,
    Marca: 2,
    Canal: 3,
    Subcanal: 4,
    Linea: 5,
    Segmento: 6,
    Cliente: 7,
    Producto: 8,
    Geografia: 9,
    Director: 10
  }

  getData() {
    const date: string = this.formatService.formatDate(this.currentDate, true, true);
    this.asiVamosService.dataClient.subscribe({
      next: (res) => {
        if(JSON.stringify(res) !== "{}") {
          // this.httpClient.get<any>(`https://www.brinsadigital.com.co/asivamos-api/asivamos/${res.Vendedor}/${date}`)
          let retainLast: any = null;
          if(this.currentBox !== null) {
            retainLast = this.data.Segmentacion.filter((seg: any) => seg.Segmento === this.currentBox)[0].Valores;
          }
          this.httpClient.post<any>(`https://www.brinsadigital.com.co/asivamos-api/asivamos/getfiltro/${res.Vendedor}/${date}`, this.temporalFilters)
          .subscribe({
            next: (res2) => {
              this.data = res2;
              this.data.Segmentacion.map((seg: any) => seg.Valores = seg.Valores.map((val: any) => val.Valor));
              this.data.Segmentacion.forEach((seg: any) => {
              seg.order = this.order[seg.Segmento]
                if(seg.Segmento === this.currentBox) {
                  seg.Valores = retainLast;
                  this.currentBox = null;
                }
              })
              this.data.Segmentacion.forEach((seg: any) => {
                if(seg.Segmento === "Director") {
                  seg.Valores.sort((a: any, b: any) => {
                    if(a.split('-')[1] > b.split('-')[1]) {
                      return 1;
                    }else if(a.split('-')[1] < b.split('-')[1]) {
                      return -1;
                    }else{
                      return 0;
                    }
                  });
                }else{
                  seg.Valores.sort();
                }
              })
              this.data.Segmentacion.sort((a: any, b: any) => a.order - b.order);

              console.log('>>> ', this.data);

              this.asiVamosService.allDirectors.mutate(sts => {
                sts.list = res2.Segmentacion.filter((flt: any) => flt.Segmento === 'Director')[0].Valores;
                sts.current = this.temporalDirector;
              })
              this.disableAll = false;
            }
          })
        }
      }
    })
  }

  close() {
    this.sig?.mutate((currentValue: any) => currentValue.open = false)
  }

  apply() {
    this.sig?.mutate(state => state.filters = this.filters);
    this.sig?.mutate(state => state.update = true);
    this.sig?.mutate((currentValue: any) => currentValue.open = false);
    this.asiVamosService.allDirectors.mutate(sts => sts.current = this.temporalDirector);
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

  changeDirector(code: any, event: any) {
    // this.disableAll = true;
    if(!event.target.checked) {
      this.temporalDirector = "";
      this.filters = this.filters.filter((flt: any) => flt.categoria !== "Director");
      this.currentBox = "Director";
    }else{
      this.filters = this.filters.filter((flt: any) => flt.categoria !== "Director");
      this.filters.push({categoria: "Director", campo: code});
      this.temporalDirector = ((this.data.Segmentacion.filter((flt: any) => flt.Segmento === 'Director')[0].Valores).filter((flt2: any) => flt2.startsWith(code))[0]).split('-')[1];      
      this.currentBox = null;
    }
    // this.formatFilters();
  }

  changeFilters(categoria: string, campo: string, evento: any) {
    // this.disableAll = true;
    if(evento.target.checked) {
      this.currentBox = categoria;
      this.filters.push({categoria, campo});
    }else{
      this.currentBox = null;
      this.filters = this.filters.filter((flt: any) => {
        if(flt.categoria !== categoria || flt.campo !== campo) {
          return true;
        }else{
          return false;
        }
      });
    }
    this.omitInit = true;
    // this.formatFilters();
  }

  formatFilters() {
    this.temporalFilters.Filtro = {};
    this.temporalFilters.Filtro.Canal = this.filters.filter((flt: any) => flt.categoria === "Canal").map((flt: any) => flt.campo);
    this.temporalFilters.Filtro.Subcanal = this.filters.filter((flt: any) => flt.categoria === "Subcanal").map((flt: any) => flt.campo);
    this.temporalFilters.Filtro.Linea = this.filters.filter((flt: any) => flt.categoria === "Linea").map((flt: any) => flt.campo);
    this.temporalFilters.Filtro.Segmento = this.filters.filter((flt: any) => flt.categoria === "Segmento").map((flt: any) => flt.campo);
    this.temporalFilters.Filtro.Vendedor = this.filters.filter((flt: any) => flt.categoria === "Vendedor").map((flt: any) => flt.campo);
    this.temporalFilters.Filtro.Cliente = this.filters.filter((flt: any) => flt.categoria === "Cliente").map((flt: any) => flt.campo);
    this.temporalFilters.Filtro.Producto = this.filters.filter((flt: any) => flt.categoria === "Producto").map((flt: any) => flt.campo);
    this.temporalFilters.Filtro.Marca = this.filters.filter((flt: any) => flt.categoria === "Marca").map((flt: any) => flt.campo);
    this.temporalFilters.Filtro.UEN = this.filters.filter((flt: any) => flt.categoria === "UEN").map((flt: any) => flt.campo);
    this.temporalFilters.Filtro.Geografia = this.filters.filter((flt: any) => flt.categoria === "Geografia").map((flt: any) => flt.campo);
    if(this.filters.some((flt: any) => flt.categoria === "Director")) {
      this.temporalFilters.Filtro.Director = [this.temporalDirector];
    }
    this.getData();
  }

  isChecked(categ: string, field: string) {
    return this.filters.some((flt: any) => flt.categoria === categ && flt.campo === field);
  }

  showFilters() {
    console.log('Temporal ', this.temporalDirector);
  }

  selectedDirector(value: string) {
    return value.split('-')[1] === this.temporalDirector;
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