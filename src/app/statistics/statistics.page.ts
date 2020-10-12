import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

import { Chart } from "chart.js";

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.page.html',
  styleUrls: ['./statistics.page.scss'],
})
export class StatisticsPage {

  private contentHidden: boolean;

  private timeSpan: string;
  private chartTimeSteps: string[];
  private chartValuesSolar: number[];
  private chartValuesAdditional: number[];

  private solarPercentText: string = "";
  private additionalPercentText: string = "";
  private co2Text: string = "";

  constructor(private storage: Storage, private navCtrl: NavController) {
    this.contentHidden = true;

    this.timeSpan = "day";
    this.chartTimeSteps = [];
    this.chartValuesSolar = [];
    this.chartValuesAdditional = [];
  }

  ionViewWillEnter() {
    this.contentHidden = true;
    this.redirectIfNotLoggedIn();

    this.fillHistoryBarChart();
    this.callDrawSvg();
  }

  private timeSpanChanged(event) {
    this.timeSpan = event.detail.value;

    //Todo: Get Data from backend
    this.fillHistoryBarChart();
    this.callDrawSvg();
  }

  private fillHistoryBarChart() {

    let randomData = this.debugRandomDataGenerator(this.timeSpan);

    this.chartTimeSteps = randomData.t;
    this.chartValuesSolar = randomData.s;
    this.chartValuesAdditional = randomData.a;

    new Chart(document.getElementById("historyBarChart"), {
      // type: 'line',
      type: 'horizontalBar',
      data: {
        labels: this.chartTimeSteps,
        datasets: [
          {
            type: 'horizontalBar',
            data: this.chartValuesSolar,
            label: "Solar",
            backgroundColor: getComputedStyle(document.body).getPropertyValue("--ion-color-primary"), //Workaround here, chart cannot access css directly
            borderWidth: 0
          },
          {
            type: 'horizontalBar',
            data: this.chartValuesAdditional,
            label: "Zusatzheizung",
            backgroundColor: getComputedStyle(document.body).getPropertyValue("--ion-color-secondary"), //Workaround here, chart cannot access css directly
            borderWidth: 0
          }
        ]
      },
      options: {
        title: {
          display: false,
          text: 'Energieproduktion'
        },
        legend: {
          display: false
        },
        scales: {
          xAxes: [{ stacked: false }],
          yAxes: [{ stacked: true }]
        },
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  private debugRandomDataGenerator(timerange: string) {

    let timeSteps: string[] = [];
    let energySolar: number[] = [];
    let energyAdditional: number[] = [];

    let countStart: number = 0;
    let countUntil: number = 0;

    switch (timerange) {
      case "day":
        countStart = 0;
        countUntil = 24;
        break;
      case "month":
        countStart = 1;
        countUntil = 30;
        break;
      case "year":
        countStart = 1;
        countUntil = 13;
        break;
      case "whole":
        countUntil = -1;
        break;
      default:
        console.error("Illegal timerange in debugRandomDataGenerator, '" + timerange + "'");
        break;
    }


    if (0 < countUntil) {
      for (let index: number = 0; index < countUntil; index++) {

        timeSteps.push(index.toString());

        let s = 20.0 * Math.random();
        let a = 20.0 * Math.random();

        energySolar.push(s);
        energyAdditional.push(a);
      }
    }

    return { t: timeSteps, s: energySolar, a: energyAdditional };
  }

  private callDrawSvg() {
    var solAmount = Math.random();
    var co2Amount = Math.random();

    //Set the texts
    this.solarPercentText = (solAmount * 100.0).toFixed(0) + "%";
    this.additionalPercentText = ((1.0 - solAmount) * 100.0).toFixed(0) + "%";

    this.co2Text = (co2Amount * 1000.0).toFixed(0) + "kg/a";

    //Set the Bars
    this.drawSvg(solAmount, "svgBar");
    this.drawSvg(co2Amount, "svgBarCO2");
  }

  private drawSvg(positiveValue: number, svgId: string) {

    const thickness: number = 10.0;
    const offset: number = thickness / 2.0;

    const availableForLine: number = 100.0 - (2.0 * offset);

    const solarLen: number = availableForLine * positiveValue;

    const solarColor: string = "var(--ion-color-primary)";
    const additionalColor: string = "var(--ion-color-secondary)";

    var newLine;

    //Draw the horizontal line
    if (true) {
      //Left circle of additional
      if (0.0 >= positiveValue) {
        newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        newLine.setAttribute('class', "additionalLine");
        newLine.setAttribute('x1', offset.toString());
        newLine.setAttribute('y1', offset.toString());
        newLine.setAttribute('x2', offset.toString());
        newLine.setAttribute('y2', offset.toString());
        newLine.setAttribute("stroke", additionalColor);
        newLine.setAttribute("stroke-linecap", "round");
        newLine.setAttribute("stroke-width", thickness.toString());
        document.getElementById(svgId).appendChild(newLine);
      }

      //Right circle of additional
      if (1.0 > positiveValue) {
        newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        newLine.setAttribute('class', "additionalLine");
        newLine.setAttribute('x1', (offset + availableForLine).toString());
        newLine.setAttribute('y1', offset.toString());
        newLine.setAttribute('x2', (offset + availableForLine).toString());
        newLine.setAttribute('y2', offset.toString());
        newLine.setAttribute("stroke", additionalColor);
        newLine.setAttribute("stroke-linecap", "flat"); //, "round");
        newLine.setAttribute("stroke-width", thickness.toString());
        document.getElementById(svgId).appendChild(newLine);
      }

      //Left circle of solar
      if (0.0 < positiveValue) {
        newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        newLine.setAttribute('x1', offset.toString());
        newLine.setAttribute('y1', offset.toString());
        newLine.setAttribute('x2', offset.toString());
        newLine.setAttribute('y2', offset.toString());
        newLine.setAttribute("stroke", solarColor);
        newLine.setAttribute("stroke-linecap", "flat"); //, "round");
        newLine.setAttribute("stroke-width", thickness.toString());
        document.getElementById(svgId).appendChild(newLine);
      }

      //Additional Line
      if (1.0 > positiveValue) {
        newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        newLine.setAttribute('class', "additionalLine");
        newLine.setAttribute('x1', offset.toString());
        newLine.setAttribute('y1', offset.toString());
        newLine.setAttribute('x2', (offset + availableForLine).toString());
        newLine.setAttribute('y2', offset.toString());
        newLine.setAttribute("stroke", additionalColor);
        newLine.setAttribute("stroke-linecap", "flat");
        newLine.setAttribute("stroke-width", thickness.toString());
        document.getElementById(svgId).appendChild(newLine);
      }

      //Solar Line
      if (0.0 < positiveValue) {
        newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        newLine.setAttribute('x1', offset.toString());
        newLine.setAttribute('y1', offset.toString());
        newLine.setAttribute('x2', (offset + solarLen).toString());
        newLine.setAttribute('y2', offset.toString());
        newLine.setAttribute("stroke", solarColor);
        newLine.setAttribute("stroke-linecap", "flat");
        newLine.setAttribute("stroke-width", thickness.toString());
        document.getElementById(svgId).appendChild(newLine);
      }

      //Right circle of solar
      if (1.0 <= positiveValue) {
        newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        newLine.setAttribute('x1', (offset + availableForLine).toString());
        newLine.setAttribute('y1', offset.toString());
        newLine.setAttribute('x2', (offset + availableForLine).toString());
        newLine.setAttribute('y2', offset.toString());
        newLine.setAttribute("stroke", solarColor);
        newLine.setAttribute("stroke-linecap", "round");
        newLine.setAttribute("stroke-width", thickness.toString());
        document.getElementById(svgId).appendChild(newLine);
      }
    }


  }

  //Check login status for redirection
  private redirectIfNotLoggedIn() {
    this.storage.get("loggedIn")
      .then((val) => {
        if (true === val) {
          this.contentHidden = false;
        }
        else {
          this.navCtrl.navigateForward("/tabs/more");
        }
      })
  }
}
