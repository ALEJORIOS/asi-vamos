import { Component, AfterViewInit, ViewChild, LOCALE_ID, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as charts from 'src/assets/charts';

import localeEs from '@angular/common/locales/es-CO';
import { registerLocaleData } from '@angular/common';
import { CrudService } from 'src/app/config/crud.service';
import { FormatService } from 'src/app/services/format.service';
import { TopbarComponent } from 'src/app/componensts/topbar/topbar.component';
import { FilterBoxComponent } from 'src/app/componensts/filter-box/filter-box.component';
import { AsiVamosService, DataActions } from 'src/app/services/asi-vamos.service';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { SpinnerComponent, SpinnerMethods } from 'src/app/components/spinner/spinner.component';
import { ActivatedRoute } from '@angular/router';
registerLocaleData(localeEs, 'es');

@Component({
  standalone: true,
  selector: 'app-asi-vamos',
  templateUrl: './asi-vamos.component.html',
  styleUrls: ['./asi-vamos.component.scss'],
  providers: [{provide: LOCALE_ID, useValue: 'es'}],
  imports: [CommonModule, TopbarComponent, FilterBoxComponent, NgbDropdownModule, FormsModule, SpinnerComponent]
})
export default class AsiVamosComponent implements AfterViewInit {

  @ViewChild('summaryPriceChart') summaryPriceChart: any;
  @ViewChild('summaryTonsChart') summaryTonsChart: any;
  @ViewChild('comparativePriceChart') comparativePriceChart: any;
  @ViewChild('comparativeTonsChart') comparativeTonsChart: any;

  dataObject: any;
  currentDate: Date = new Date();

  generalMoneyChart: any;
  generalTonsChart: any;
  generalComparativePriceChart: any;
  generalComparativeTonsChart: any;

  valueMoneyCurrent: number = 0;
  valueMoneyBudget: number = 0;
  valueTonsCurrent: number = 0;
  valueTonsBudget: number = 0;
  averageMoney: number = 0;
  averageTons: number = 0;

  records: any = [];

  valueComparisonMoneyCurrent: number[] = [];
  valueComparisonMoneyPast: number[] = [];
  valueComparisonTonsCurrent: number[] = [];
  valueComparisonTonsPast: number[] = [];

  dataActions: any = {};

  rotateTable: boolean = false;

  currentActive: string = "Canal";

  filters: any = {};

  userData: any;

  showFilters: boolean = false;

  inMenu: boolean = false;

  spinner = new SpinnerMethods();

  fullscreen: boolean = false;

  showColumns: any = {
    valor: true,
    tonelada: true,
    precTon: true,
    plan: true,
    pedPend: true
  }

  totals: any = {
    TonMes: 0,
    TonMesPpto: 0,
    ValorMes: 0,
    ValorPpto: 0,
    ValorPedPend: 0,
    PlanDUni: 0,
    PlanDValor: 0
  }

  loading: any = {
    Canal: false,
    Subcanal: false,
    Linea: false,
    Segmento: false,
    Vendedor: false,
    Cliente: false,
    Producto: false,
    Marca: false,
    UEN: false
  }

  constructor(private gridService: CrudService, private formatService: FormatService, public asiVamosService: AsiVamosService, private route: ActivatedRoute) {
    this.initialize();
    effect(() => {
      if(asiVamosService.filterStatus().update) {
        if(asiVamosService.filterStatus().filters.length > 0) {
          this.filters.Filtro = {};
          this.filters.Filtro.Canal = asiVamosService.filterStatus().filters.filter((flt: any) => flt.categoria === "Canal").map((flt: any) => flt.campo);
          this.filters.Filtro.Subcanal = asiVamosService.filterStatus().filters.filter((flt: any) => flt.categoria === "Subcanal").map((flt: any) => flt.campo);
          this.filters.Filtro.Linea = asiVamosService.filterStatus().filters.filter((flt: any) => flt.categoria === "Linea").map((flt: any) => flt.campo);
          this.filters.Filtro.Segmento = asiVamosService.filterStatus().filters.filter((flt: any) => flt.categoria === "Segmento").map((flt: any) => flt.campo);
          this.filters.Filtro.Vendedor = asiVamosService.filterStatus().filters.filter((flt: any) => flt.categoria === "Vendedor").map((flt: any) => flt.campo);
          this.filters.Filtro.Cliente = asiVamosService.filterStatus().filters.filter((flt: any) => flt.categoria === "Cliente").map((flt: any) => flt.campo);
          this.filters.Filtro.Producto = asiVamosService.filterStatus().filters.filter((flt: any) => flt.categoria === "Producto").map((flt: any) => flt.campo);
          this.filters.Filtro.Marca = asiVamosService.filterStatus().filters.filter((flt: any) => flt.categoria === "Marca").map((flt: any) => flt.campo);
          this.filters.Filtro.UEN = asiVamosService.filterStatus().filters.filter((flt: any) => flt.categoria === "UEN").map((flt: any) => flt.campo);
        }else{
          this.filters.Filtro = {};
        }
        if(asiVamosService.filterStatus().filters.some((flt: any) => flt.categoria === "Director")) {
          this.userData.Vendedor = asiVamosService.filterStatus().filters.filter((flt: any) => flt.categoria === "Director")[0].campo; 
          asiVamosService.filterStatus.mutate((flt: any) => flt.filters = flt.filters.filter((flt: any) => flt.categoria !== 'Director'));
        }
        asiVamosService.filterStatus.mutate(sts => sts.update = false);
        this.getRecords(this.userData.Vendedor, this.formatService.formatDate(this.currentDate, true, true), this.currentActive);
      }

    }, {allowSignalWrites: true})
  }
  
  async initialize() {
    let token = "";
    this.route.queryParams.subscribe((params: any) => {
      token = params.token;
    })
    this.userData = await this.asiVamosService.decryptToken(token);
    this.asiVamosService.dataClient.next(this.userData);
    this.getRecords(this.userData.Vendedor, this.formatService.formatDate(this.currentDate, true, true), this.currentActive);
  }
  
  getRecords(director: number, period: string, segment: string = 'Producto') {
    this.spinner.loading = true;
    this.gridService.getRecords(director, period, segment, this.filters).subscribe({
      next: (res) => {
        this.spinner.loading = false;
        this.records = res;
        this.records.sort((a: any, b: any) => {
          if(b.Agrupacion > a.Agrupacion) {
            return -1;
          }else if(b.Agrupacion < a.Agrupacion){
            return 1;
          }else{
            return 0
          }
          
        
        });
        this.updateTotals();
        this.updateData(res);
        Object.keys(this.loading).forEach(categ => {
          this.loading[categ] = false;
        })
      }
    })
  }

  updateTotals() {
    Object.keys(this.totals).forEach(agr => {
      this.totals[agr] = this.records.reduce((acc: number, cv: any) => acc+cv[agr], 0);
    })
  }

  setCurrent(current: string) {
    this.currentActive = current;
    Object.keys(this.totals).forEach(total => {
      this.totals[total] = 0;
    })
    this.loading[current] = true;
    this.records = [];
    this.getRecords(this.userData.Vendedor, this.formatService.formatDate(this.currentDate, true, true), current)
  }

  linkToDashboard(code: string) {
    return `https://www.brinsadigital.com.co/brinsa-dashboard/dashboard/${code}`
  }

  removeFilter() {
    this.userData.Vendedor = 0;
    this.asiVamosService.allDirectors.mutate(sts => sts.current = 0)
    this.asiVamosService.filterStatus.mutate(sts => sts.filters = []);
    this.asiVamosService.filterStatus.mutate(sts => sts.update = true);
    this.asiVamosService.removeFilters.next(true);
  }
  
  openFilters() {
    this.asiVamosService.filterStatus.mutate(sts => sts.open = true);
  }

  rotate() {
    this.rotateTable = !this.rotateTable;
  }

  showFiltersBoxPreview() {
    if(this.filters.Filtro && Object.keys(this.filters.Filtro).length && this.asiVamosService.filterStatus().filters.length) {
      this.showFilters = true;
    }
  }

  toggleFullscreen() {
    console.log('Entra');
    this.fullscreen = !this.fullscreen;
  }

  hideFiltersBoxPreview() {
    this.showFilters = false;
  }

  updateData(res: any) {
    this.dataActions = new DataActions(res);
    this.valueMoneyCurrent = this.dataActions.sum("ValorMes");
    this.valueMoneyBudget = this.dataActions.sum("ValorPpto");
    this.valueTonsCurrent = this.dataActions.sum("TonMes");
    this.valueTonsBudget = this.dataActions.sum("TonMesPpto");
    this.averageMoney = Math.round(this.valueMoneyCurrent * 100 / this.valueMoneyBudget) || 0;
    this.averageTons = Math.round(this.valueTonsCurrent * 100 / this.valueTonsBudget) || 0;
    this.updateSummaryCharts();
  }

  updateSummaryCharts() {
    this.generalMoneyChart.data.datasets[0].data = [this.valueMoneyCurrent, this.valueMoneyBudget-this.valueMoneyCurrent]
    this.generalTonsChart.data.datasets[0].data = [this.valueTonsCurrent, this.valueTonsBudget-this.valueTonsCurrent]
    this.generalMoneyChart.config.options.elements.center.text = String(this.averageMoney).padStart(2,"0")+"%";
    this.generalTonsChart.config.options.elements.center.text = String(this.averageTons).padStart(2,"0")+"%";
    this.generalMoneyChart.update();
    this.generalTonsChart.update(); 
  }

  updateComparisonCharts() {
    this.generalComparativePriceChart.data.datasets[0].data = this.valueComparisonMoneyCurrent;
    this.generalComparativePriceChart.data.datasets[1].data = this.valueComparisonMoneyPast;
    this.generalComparativeTonsChart.data.datasets[0].data = this.valueComparisonTonsCurrent;
    this.generalComparativeTonsChart.data.datasets[1].data = this.valueComparisonTonsPast;
    this.generalComparativePriceChart.data.labels = this.formatService.getPastMonths(this.currentDate, 12).labels;
    this.generalComparativeTonsChart.data.labels = this.formatService.getPastMonths(this.currentDate, 12).labels;
    this.generalComparativePriceChart.update();
    this.generalComparativeTonsChart.update();
  }

  drawSummaryCharts() {
    this.generalMoneyChart = new charts.Chart(this.summaryPriceChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Ventas realizadas', 'Falta'],
        datasets: [{
          label: "MM COP",
          data: [0,1],
          backgroundColor: [
            '#62993E',
            '#A1C490'
          ],
          hoverOffset: 4
        }]
      },
      options: {
        cutout: 30,
        responsive: true,
        elements: {
          center: {
            text: this.averageMoney+"%",
            color: "#62993E",
            minFontSize: 5,
            maxFontSize: 20,
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    this.generalTonsChart = new charts.Chart(this.summaryTonsChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Toneladas despachadas', 'Toneladas faltantes'],
        datasets: [{
          label: "Toneladas",
          data: [0,1],
          backgroundColor: [
            '#5089BC',
            '#97B9E0'
          ],
          hoverOffset: 4
        }]
      },
      options: {
        cutout: 30,
        elements: {
          center: {
            text: this.averageTons+"%",
            color: "#5089BC",
            minFontSize: 5,
            maxFontSize: 20,
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  ngAfterViewInit() {
    this.drawSummaryCharts();
    // this.drawComparisonCharts();
  }
}

charts.register({
  id: "TextDonut",
  beforeDraw: (chart: any) => { 
    if (chart.config.options.elements?.center && chart.config._config.type === "doughnut") {
      // Get ctx from string
      var ctx = chart.ctx;
      const innerRadius = chart.width*(chart.config.options.cutout)/100;

      // Get options from the center object in options
      var centerConfig = chart.config.options.elements.center;
      var fontStyle = centerConfig.fontStyle || 'Arial';
      var txt = centerConfig.text;
      var color = centerConfig.color || '#000';
      var maxFontSize = centerConfig.maxFontSize || 75;
      var sidePadding = centerConfig.sidePadding || 20;
      var sidePaddingCalculated = (sidePadding / 100) * (innerRadius * 2)
      // Start with a base font of 30px
      ctx.font = "30px " + fontStyle;

      // Get the width of the string and also the width of the element minus 10 to give it 5px side padding
      var stringWidth = ctx.measureText(txt).width;
      var elementWidth = (innerRadius * 2) - sidePaddingCalculated;

      // Find out how much the font can grow in width.
      var widthRatio = elementWidth / stringWidth;
      var newFontSize = Math.floor(30 * widthRatio);
      var elementHeight = (innerRadius * 2);

      // Pick a new font size so it will not be larger than the height of label.
      var fontSizeToUse = Math.min(newFontSize, elementHeight, maxFontSize);
      var minFontSize = centerConfig.minFontSize;
      var lineHeight = centerConfig.lineHeight || 25;
      var wrapText = false;

      if (minFontSize === undefined) {
        minFontSize = 20;
      }

      if (minFontSize && fontSizeToUse < minFontSize) {
        fontSizeToUse = minFontSize;
        wrapText = true;
      }

      // Set font settings to draw it correctly.
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
      var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
      ctx.font = fontSizeToUse + "px " + fontStyle;
      ctx.fillStyle = color;

      if (!wrapText) {
        ctx.fillText(txt, centerX, centerY);
        return;
      }

      var words = txt.split(' ');
      var line = '';
      var lines = [];

      // Break words up into multiple lines if necessary
      for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = ctx.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > elementWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }

      // Move the center up depending on line height and number of lines
      centerY -= (lines.length / 2) * lineHeight;

      for (var n = 0; n < lines.length; n++) {
        ctx.fillText(lines[n], centerX, centerY);
        centerY += lineHeight;
      }
      //Draw text in center
      ctx.fillText(line, centerX, centerY);
    }
  }
})

interface FormattedData {
  mesNacional: MesActual,
  mesExportaciones: MesActual,
  ppNal: MesActual,
  ppExp: MesActual
}

interface MesActual {
  consumoMasivo: any;
  industria: any;
}

interface NotasCredito {
  causal: Causal;
}

interface Causal {
  comercial: any;
  operacion: any;
  logistica: any;
  sinDefinir: any;
}