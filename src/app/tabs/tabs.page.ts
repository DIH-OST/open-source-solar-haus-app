import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  private contentHidden: boolean;

  constructor(private storage: Storage, private navCtrl: NavController) {
    this.contentHidden = true;
  }

  ionViewWillEnter() {
    //If not already done subscribe to store changes
    this.checkForLoginState();
  }


  private checkForLoginState() {
    if (undefined !== this.storage) {    
      this.storage.get("loggedIn")
        .then((val) => {
          if (true === val) {
            this.contentHidden = false;
          }
          else {
            this.contentHidden = true;
          }
        });
    }

    setTimeout(() => {       
      this.checkForLoginState();
    }, 1000);
  }
}