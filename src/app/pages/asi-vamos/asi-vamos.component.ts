import { Component, AfterViewInit, ViewChild, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as charts from 'src/assets/charts';

import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { CrudService } from 'src/app/config/crud.service';
import { FormatService } from 'src/app/services/format.service';
import { combineLatest } from 'rxjs';
import { TopbarComponent } from 'src/app/componensts/topbar/topbar.component';
registerLocaleData(localeEs, 'es');

@Component({
  standalone: true,
  selector: 'app-asi-vamos',
  templateUrl: './asi-vamos.component.html',
  styleUrls: ['./asi-vamos.component.scss'],
  providers: [{provide: LOCALE_ID, useValue: 'es'}],
  imports: [CommonModule, TopbarComponent]
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
  averageMoney: string = "0";
  averageTons: string = "0";

  valueComparisonMoneyCurrent: number[] = [];
  valueComparisonMoneyPast: number[] = [];
  valueComparisonTonsCurrent: number[] = [];
  valueComparisonTonsPast: number[] = [];

  constructor(private gridService: CrudService, private formatService: FormatService) {
    this.getSummaryData();
    this.getComparativeData(formatService.getPastMonths(this.currentDate, 12).dates);

  }

  getSummaryData() {
    const requestBody: any = {
      id: "asivamos_list",
      take: 1,
      skip: 0,
      filter: [
        {
          field: "Periodo",
          condition: `= '${this.formatService.formatDate(this.currentDate, true, true)}'`
        }
      ],
      aggregate: [
        {
          field: "VlrMesAct",
          function: "SUM"
        },
        {
          field: "VlrMesPpt",
          function: "SUM"
        },
        {
          field: "TonMesAct",
          function: "SUM"
        },
        {
          field: "TonMesPpt",
          function: "SUM"
        }
      ]
    }
    this.gridService.getData(requestBody).subscribe({
      next: (res) => {
        this.valueMoneyCurrent = res.aggregate[0].value;
        this.valueMoneyBudget = res.aggregate[1].value;
        this.valueTonsCurrent = res.aggregate[2].value;
        this.valueTonsBudget = res.aggregate[3].value;
        this.averageMoney = String(this.valueMoneyCurrent * 100 / this.valueMoneyBudget);
        this.averageTons = String(this.valueTonsCurrent * 100 / this.valueTonsBudget);
        this.updateSummaryCharts();
      }
    })
  }

  getComparativeData(dates: string[]) {
    const observables: any = [];
    dates.forEach((date: string) => {
      const requestBody: any = {
        id: "asivamos_list",
        take: 1,
        filter: [
          {
            field: "Periodo",
            condition: `= '${date}'`
          }
        ],
        aggregate: [
          {
            field: "VlrMesAct",
            function: "SUM"
          },
          {
            field: "VlrMesAnt",
            function: "SUM"
          },
          {
            field: "TonMesAct",
            function: "SUM"
          },
          {
            field: "TonMesAnt",
            function: "SUM"
          }
        ]
      }
      observables.push(this.gridService.getData(requestBody))
    })
    const allObservables: any = combineLatest(observables);
    allObservables.subscribe({
      next: (res: any) => {
        this.valueComparisonMoneyCurrent = res.map((record: any) => {
          return record.aggregate[0].value;
        })
        this.valueComparisonMoneyPast = res.map((record: any) => {
          return record.aggregate[1].value;
        })
        this.valueComparisonTonsCurrent = res.map((record: any) => {
          return record.aggregate[2].value;
        })
        this.valueComparisonTonsPast = res.map((record: any) => {
          return record.aggregate[3].value;
        })
        this.updateComparisonCharts();
      }
    })
  }

  updateSummaryCharts() {
    this.generalMoneyChart.data.datasets[0].data = [this.valueMoneyCurrent, this.valueMoneyBudget-this.valueMoneyCurrent]
    this.generalTonsChart.data.datasets[0].data = [this.valueTonsCurrent, this.valueTonsBudget-this.valueTonsCurrent]
    this.generalMoneyChart.config.options.elements.center.text = this.averageMoney.substring(0,2).padStart(2,"0")+"%";
    this.generalTonsChart.config.options.elements.center.text = this.averageTons.substring(0,2).padStart(2,"0")+"%";
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

  drawComparisonCharts() {
    this.generalComparativePriceChart = new charts.Chart(this.comparativePriceChart.nativeElement, {
      type: 'line',
      data: {
        labels: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
        datasets: [{
          label: "Año Actual",
          data: [0,0,0,0,0,0,0,0,0,0,0,0],
          borderColor: '#62993E',
          fill: true,
          backgroundColor: '#62993E90',
          tension: 0.1
        },
        {
          label: "Año Anterior",
          data: [0,0,0,0,0,0,0,0,0,0,0,0],
          borderColor: '#A1C490',
          tension: 0.1
        }]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        // aspectRatio: 3/1
      }
    })

    this.generalComparativeTonsChart = new charts.Chart(this.comparativeTonsChart.nativeElement, {
      type: 'line',
      data: {
        labels: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
        datasets: [{
          label: "Año Actual",
          data: [0,0,0,0,0,0,0,0,0,0,0,0],
          borderColor: '#5089BC',
          fill: true,
          backgroundColor: '#5089BC90',
          tension: 0.1
        },
        {
          label: "Año Anterior",
          data: [0,0,0,0,0,0,0,0,0,0,0,0],
          borderColor: '#97B9E0',
          tension: 0.1
        }]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        // aspectRatio: 3/1
      }
    })
  }

  ngAfterViewInit() {
    this.drawSummaryCharts();
    this.drawComparisonCharts();
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