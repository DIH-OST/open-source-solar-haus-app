import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http/ngx';

import { Chart } from "chart.js";

import { SchemaGetter } from '../helpers/schema-getter';
import { GetterReturnTemplate } from '../helpers/getter-return-template';

@Component({
  selector: 'app-status',
  templateUrl: './status.page.html',
  styleUrls: ['./status.page.scss'],
})
export class StatusPage extends GetterReturnTemplate {

  private readonly RATIO_CHART_ID: string = "ratioPieChart";
  private readonly CONSUMPTION_CHART_ID: string = "consumptionPieChart";
  private COLOR_SOLAR: string;
  private COLOR_ADDITIONAL: string;
  private COLOR_CONSUMPTION: string = "rgb(254,83,3)";

  private schemaGetter: SchemaGetter;

  public dateString: string = "16.10.2020";
  public timeString: string = "12:34";
  public solarPowerString: string = "xxx kW";
  public additionalPowerString: string = "xxx kW";
  public ratioString: string = "Anteil Solar: xxx %";
  public consumptionString: string = "xxx kW";

  private TaUpdateTimeouts = [];

  private contentHidden: boolean;

  constructor(private http: HTTP, private storage: Storage, private navCtrl: NavController) {
    super();

    this.solarPowerString = "";

    this.schemaGetter = new SchemaGetter(this.http, this.storage);

    this.contentHidden = true;
  }

  private getColorsFromCSS() {
    this.COLOR_SOLAR = getComputedStyle(document.body).getPropertyValue("--ion-color-primary-shade") //Workaround here, chart cannot access css directly
    this.COLOR_ADDITIONAL = getComputedStyle(document.body).getPropertyValue("--ion-color-secondary") //Workaround here, chart cannot access css directly
  }


  ionViewWillEnter() {
    this.contentHidden = true;
    this.redirectIfNotLoggedIn();
    this.updateTAValues();

    this.getColorsFromCSS();

    this.updateDateAndTime();
    this.fillRatioChart();
    this.fillConsumptionChart();
  }

  ionViewDidLeave() {
    for (var i = 0; i < this.TaUpdateTimeouts.length; i++) {
      clearTimeout(this.TaUpdateTimeouts[i]);
    }
    //quick reset of the timer array you just cleared
    this.TaUpdateTimeouts = [];
  }

  //Check login status for redirection
  redirectIfNotLoggedIn() {
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

  //#region Update values from TA Backend

  private updateDateAndTime() {

    var now = new Date();
    this.dateString = now.toLocaleDateString("at-AT");
    this.timeString = now.toLocaleTimeString("at-AT");

    setTimeout(() => {
      this.updateDateAndTime();
    }, 100);

  }

  private updateTAValues() {
    this.schemaGetter.getSolarPower(this);

    //Check status in a loop  
    this.TaUpdateTimeouts.push(
      setTimeout(() => {
        this.updateTAValues();
      }, 5000)
    );
  }

  //#endregion

  //#region Energy Ratio


  private fillRatioChart() {
    // For a pie chart
    var ctx = document.getElementById(this.RATIO_CHART_ID);

    // Global Options:
    Chart.defaults.global.defaultFontColor = 'black';
    Chart.defaults.global.defaultFontSize = 16;

    var data = {
      labels: ["Zusatz ", "Solar"],
      datasets: [
        {
          fill: true,
          backgroundColor: [
            this.COLOR_ADDITIONAL,
            this.COLOR_SOLAR],
          data: [0.2, 0.8],
          // Notice the borderColor 
          borderColor: ['black', 'black'],
          borderWidth: [0, 0]
        }
      ]
    };


    var options = {
      title: {
        display: false,
        text: '',
        position: 'top'
      },
      legend: {
        display: false,
        position: "right"
      },
      labels: {
        display: true
      },
      showAllTooltips: true,
      rotation: -0.5 * Math.PI,
      responsive: true,
      aspectRatio: 1,
      maintainAspectRatio: true
    };


    // Chart declaration:
    var myBarChart = new Chart(ctx, {
      type: 'pie',
      data: data,
      options: options
    });

  }

  private fillConsumptionChart() {

    // For a pie chart
    var ctx = document.getElementById(this.CONSUMPTION_CHART_ID);

    // Global Options:
    Chart.defaults.global.defaultFontColor = 'black';
    Chart.defaults.global.defaultFontSize = 16;

    var data = {
      labels: ["Verbrauch ", ""],
      datasets: [
        {
          fill: true,
          backgroundColor: [
            this.COLOR_CONSUMPTION,
            "transparent"],
          data: [0.6, 0.4],
          // Notice the borderColor 
          borderColor: ['black', 'black'],
          borderWidth: [0, 0]
        }
      ]
    };

    var options = {
      title: {
        display: false,
        text: '',
        position: 'top'
      },
      legend: {
        display: false,
        position: "right"
      },
      labels: {
        display: true
      },
      cutoutPercentage: 75,
      rotation: -0.5 * Math.PI,
      responsive: true,
      aspectRatio: 1,
      maintainAspectRatio: true
    };


    // Chart declaration:
    var myBarChart = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: options
    });

  }

  //#endregion

}

