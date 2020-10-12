import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { EAW_HWB_ARRAY_KEY } from '../database-keys/database-keys';

@Component({
  selector: 'app-hwb',
  templateUrl: './hwb.page.html',
  styleUrls: ['./hwb.page.scss'],
})
export class HwbPage {

  private contentHidden: boolean;

  private hwbCalced: number = 0;
  private comfortTemperatur: string = "22";

  constructor(private storage: Storage, private navCtrl: NavController) {
    this.contentHidden = true;
  }

  ionViewWillEnter() {
    this.contentHidden = true;
    this.redirectIfNotLoggedIn();

    this.storage.get(EAW_HWB_ARRAY_KEY)
      .then((val) => {
        this.hwbCalced = 0;

        //Sum up all HWBs
        val.forEach(element => {
          this.hwbCalced += element;
        });

        this.moveArrows();
      })
      .catch((err) => {
        this.hwbCalced = 0;
      })
  }

  ionViewDidEnter() {
    this.moveArrows();
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

  private moveArrows() {

    const valueEnergieausweis: number = this.hwbCalced;//20 + 255 * Math.random();    //Max of 275
    const valueMeasured: number = 20 + 255 * Math.random();

    //@ts-ignore
    const scaleHeight: number = document.getElementById("coloredScale").height;
    //@ts-ignore
    const arrowHeight: number = document.getElementById("arrowLeft").height;

    const a: number = (scaleHeight * (714.0 / 792.0)) / 250;
    const b: number = arrowHeight / 2.0;

    const topLeft: number = valueEnergieausweis * a - b;
    const topRight: number = valueMeasured * a - b;

    document.getElementById("arrowLeft").style.top = topLeft.toString() + "px";
    document.getElementById("arrowRight").style.top = topRight.toString() + "px";
  }
}
