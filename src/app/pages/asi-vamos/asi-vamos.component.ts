import { Component, AfterViewInit, ViewChild, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as charts from 'src/assets/charts';

import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { CrudService } from 'src/app/config/crud.service';
import { FormatService } from 'src/app/services/format.service';
import { combineLatest } from 'rxjs';
import { TopbarComponent } from 'src/app/componensts/topbar/topbar.component';
import { FilterBoxComponent } from 'src/app/componensts/filter-box/filter-box.component';
import { DataActions } from 'src/app/services/asi-vamos.service';
registerLocaleData(localeEs, 'es');

@Component({
  standalone: true,
  selector: 'app-asi-vamos',
  templateUrl: './asi-vamos.component.html',
  styleUrls: ['./asi-vamos.component.scss'],
  providers: [{provide: LOCALE_ID, useValue: 'es'}],
  imports: [CommonModule, TopbarComponent, FilterBoxComponent]
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

  valueComparisonMoneyCurrent: number[] = [];
  valueComparisonMoneyPast: number[] = [];
  valueComparisonTonsCurrent: number[] = [];
  valueComparisonTonsPast: number[] = [];

  dataActions: any = {};

  records = [    
    {
      TonMes: 1,
      TonMesPpto: 1,
      TonMesAAnt: 1,
      TonAcum: 1,
      TonAcumPpto: 1,
      TonAcumAAnt: 1,
      ValorMes: 1,
      ValorPpto: 1,
      ValorMesAAnt: 1,
      ValorAcum: 1,
      ValorAcumPpto: 1,
      ValorAcumAAnt: 1,
      ValorPedPend: 1,
      PlanDUni: 1,
      PlanDValor: 1,
      Devolucion: 1,
      NotaCredito: 1,
      CodCausalNC: 1,
      CausalNC: 1
    }
  ]

  constructor(private gridService: CrudService, private formatService: FormatService) {
    this.getAllData();
  }

  getAllData() {
    const requestBody: any = {
      id: "asivamos_list",
      take: 0,
      filter: [
        {
          field: "Periodo",
          condition: "= '2023-09-01'"
        }
      ]
    }
    this.gridService.getData(requestBody).subscribe({
      next: (res) => {
        this.updateData(res);
        this.updateComparativeData(res, this.formatService.getPastMonths(this.currentDate, 12).dates);
        console.log('last: ', res.rows.at(-1));
      }
    })
  }

  

  process(rawData: any) {

  }

  updateData(res: any) {
    this.dataActions = new DataActions(res.rows);
    const date: string = `${this.formatService.formatDate(this.currentDate, true, true)}`;
    // const date: string = "2023-09-01";
    this.valueMoneyCurrent = this.dataActions.filterAndOperate([{field: "Periodo", value: date}], "sum", "ValorMes");
    this.valueMoneyBudget = this.dataActions.filterAndOperate([{field: "Periodo", value: date}], "sum", "ValorPpto");
    this.valueTonsCurrent = this.dataActions.filterAndOperate([{field: "Periodo", value: date}], "sum", "TonMes");
    this.valueTonsBudget = this.dataActions.filterAndOperate([{field: "Periodo", value: date}], "sum", "TonMesPpto");
    this.averageMoney = Math.round(this.valueMoneyCurrent * 100 / this.valueMoneyBudget);
    this.averageTons = Math.round(this.valueTonsCurrent * 100 / this.valueTonsBudget);
    this.updateSummaryCharts();
  }

  updateComparativeData(res: any, months: any[]) {
    this.valueComparisonMoneyCurrent = [];
    this.valueComparisonMoneyPast = [];
    this.valueComparisonTonsCurrent = [];
    this.valueComparisonTonsPast = [];
    const dataActions = new DataActions(res.rows);
    months.forEach(month => {
      // console.log('Month: ', month);
      // console.log('>>> ', dataActions.filterAndOperate([{field: "Periodo", value: month}], "sum", "ValorMes"));
      this.valueComparisonMoneyCurrent.push(dataActions.filterAndOperate([{field: "Periodo", value: month}], "sum", "ValorMes"))
      this.valueComparisonMoneyPast.push(dataActions.filterAndOperate([{field: "Periodo", value: month}], "sum", "ValorPpto"))
      this.valueComparisonTonsCurrent.push(dataActions.filterAndOperate([{field: "Periodo", value: month}], "sum", "TonMes"))
      this.valueComparisonTonsPast.push(dataActions.filterAndOperate([{field: "Periodo", value: month}], "sum", "TonMesPpto"))
    });
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
            maxFontSize: 25,
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
            maxFontSize: 25,
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

  // drawComparisonCharts() {
  //   this.generalComparativePriceChart = new charts.Chart(this.comparativePriceChart.nativeElement, {
  //     type: 'line',
  //     data: {
  //       labels: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  //       datasets: [{
  //         label: "Año Actual",
  //         data: [0,0,0,0,0,0,0,0,0,0,0,0],
  //         borderColor: '#62993E',
  //         fill: true,
  //         backgroundColor: '#62993E90',
  //         tension: 0.1
  //       },
  //       {
  //         label: "Año Anterior",
  //         data: [0,0,0,0,0,0,0,0,0,0,0,0],
  //         borderColor: '#A1C490',
  //         tension: 0.1
  //       }]
  //     },
  //     options: {
  //       maintainAspectRatio: false,
  //       responsive: true,
  //       // aspectRatio: 3/1
  //     }
  //   })

  //   this.generalComparativeTonsChart = new charts.Chart(this.comparativeTonsChart.nativeElement, {
  //     type: 'line',
  //     data: {
  //       labels: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  //       datasets: [{
  //         label: "Año Actual",
  //         data: [0,0,0,0,0,0,0,0,0,0,0,0],
  //         borderColor: '#5089BC',
  //         fill: true,
  //         backgroundColor: '#5089BC90',
  //         tension: 0.1
  //       },
  //       {
  //         label: "Año Anterior",
  //         data: [0,0,0,0,0,0,0,0,0,0,0,0],
  //         borderColor: '#97B9E0',
  //         tension: 0.1
  //       }]
  //     },
  //     options: {
  //       maintainAspectRatio: false,
  //       responsive: true,
  //       // aspectRatio: 3/1
  //     }
  //   })
  // }

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