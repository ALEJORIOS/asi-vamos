import { Component, computed, DoCheck, effect, ElementRef, HostListener, Input, OnChanges, signal, Signal, SimpleChanges, ViewChild, WritableSignal } from '@angular/core';
import { CommonModule, getLocaleDateFormat } from '@angular/common';
import { FilterBoxModule } from './components/filter-box.module';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { AccordionComponent } from '../accordion/accordion.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FilterBoxHeaderComponent } from './components/filter-box-header/filter-box-header.component';

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

  data: any;
  initialCoords: number[] = [0, 0];
  activeCoords: number[] = [0, 0];
  endCoords: number[] = [0, 0]

  dragging: boolean = false;

  maintainBoxRef:  any;

  @ViewChild('box', {static: false}) box!: ElementRef;

  constructor(private httpClient: HttpClient) {

    this.getData();
    
  }

  ngDoCheck(): void {
    if(this.sig?.()) {
      this.showBox = this.sig().open || false;
    }
  }

  getData() {
    const headers = new HttpHeaders().append("Authorization", "Basic "+btoa("admin:bss2015"))
    this.httpClient.get<any>('https://admin:bss2015@brinsadigital.com.co/api-db/asivamos_segmentacion/Director5009', { headers })
    .subscribe({
      next: (res) => {
        this.data = res;
      }
    })
  }

  close(event: string) {
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
}