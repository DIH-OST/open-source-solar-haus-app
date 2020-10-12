import { Component, HostListener } from '@angular/core';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http/ngx';

import { LOGGED_IN_KEY, DISPLAY_NAME_KEY, COOKIES_KEY, CMI_LIST_KEY, SELECTED_CMI_KEY, SOLAR_POWER_DATAPOINT_KEY, ADDITIONAL_POWER_DATAPOINT_KEY, EAW_HWB_ARRAY_KEY, EAW_PEBSK_KEY, EAW_CO2SK_KEY, EAW_BGF_KEY } from '../database-keys/database-keys';

import { SchemaGetter } from '../helpers/schema-getter';
import { GetterReturnTemplate } from '../helpers/getter-return-template';

@Component({
  selector: 'app-more',
  templateUrl: './more.page.html',
  styleUrls: ['./more.page.scss'],
})
export class MorePage extends GetterReturnTemplate {

  private schemaGetter: SchemaGetter;

  private loggedIn: boolean;
  private displayName: string;

  private CMIList: string[];
  private selectedCMI: string;

  //Data sources ("pos...") on the schema page
  public dataSourcesArray: string[];
  private selectedSolarPowerDatapoint: string;
  private selectedAdditionalPowerDatapoint: string;

  private pebskCalced: number = 123;
  private co2skCalced: number = 456;
  private bgfCalced: number = 789;

  private hwb01: number = 1;
  private hwb02: number = 2;
  private hwb03: number = 3;
  private hwb04: number = 4;
  private hwb05: number = 5;
  private hwb06: number = 6;
  private hwb07: number = 7;
  private hwb08: number = 8;
  private hwb09: number = 9;
  private hwb10: number = 10;
  private hwb11: number = 11;
  private hwb12: number = 12;

  private hwbArray: number[] = [
    this.hwb01,
    this.hwb02,
    this.hwb03,
    this.hwb04,
    this.hwb05,
    this.hwb06,
    this.hwb07,
    this.hwb08,
    this.hwb09,
    this.hwb10,
    this.hwb11,
    this.hwb12];

  private loginAndCMICheckerTimeouts = [];

  constructor(private http: HTTP, private storage: Storage) {
    super();

    this.loggedIn = false;
    this.displayName = "";

    this.CMIList = [];
    this.selectedCMI = "";

    this.dataSourcesArray = [];
    this.selectedSolarPowerDatapoint = "";

    this.schemaGetter = new SchemaGetter(this.http, this.storage);
  }

  //#region Initialization

  ionViewWillEnter() {
    this.getLoginStateAndCMIData();

    //Get energieausweis from database
    this.storage.get(EAW_PEBSK_KEY)
      .then((val) => {
        this.pebskCalced = val;
      })
      .catch((err) => {
        this.pebskCalced = 0;
      })

    this.storage.get(EAW_CO2SK_KEY)
      .then((val) => {
        this.co2skCalced = val;
      })
      .catch((err) => {
        this.co2skCalced = 0;
      })

    this.storage.get(EAW_BGF_KEY)
      .then((val) => {
        this.bgfCalced = val;
      })
      .catch((err) => {
        this.bgfCalced = 0;
      })

    this.storage.get(EAW_HWB_ARRAY_KEY)
      .then((val) => {
        this.fillLocalHWBfromStorage(val);
      })
      .catch((err) => {
        this.fillLocalHWBfromStorage([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      })
  }

  ionViewDidLeave() {
    for (var i = 0; i < this.loginAndCMICheckerTimeouts.length; i++) {
      clearTimeout(this.loginAndCMICheckerTimeouts[i]);
    }
    //quick reset of the timer array you just cleared
    this.loginAndCMICheckerTimeouts = [];


  }

  private getLoginStateAndCMIData() {

    this.checkForLoginState();
    this.initCMISelector().then(() => {
      this.getCMIs().then().then(() => {
        this.getSchema();
      });
    });

    //Load the selectors
    this.initSolarPowerSourceSelector();
    this.initAdditionalPowerSourceSelector();

    // Check status in a loop
    this.loginAndCMICheckerTimeouts.push(
      setTimeout(() => {
        this.getLoginStateAndCMIData();
      }, 2000)
    );
  }

  private initCMISelector() {

    return this.storage.get(SELECTED_CMI_KEY)
      .then((_selectedCMIFromStorage) => {
        if (null !== _selectedCMIFromStorage) {
          var _selectedCMIFromStorageString = <string>_selectedCMIFromStorage;

          this.CMIList.push(_selectedCMIFromStorageString);
          this.selectedCMI = _selectedCMIFromStorageString;
        }
      })
      .catch((err) => {
        console.error("Error initCMISelector");
        console.error(err);

        this.selectedCMI = "";
      })
  }

  private initSolarPowerSourceSelector() {

    //If dataSourcesArray not initialized then call again with timeout
    if (undefined === this.dataSourcesArray || null === this.dataSourcesArray || 0 === this.dataSourcesArray.length) {
      setTimeout(() => {
        this.initSolarPowerSourceSelector();
      }, 100);
      return;
    }

    return this.storage.get(SOLAR_POWER_DATAPOINT_KEY)
      .then((_fromStor) => {
        if (null !== _fromStor) {
          var _fromStorString = <string>_fromStor;

          //Look up the datapoint including the value
          this.dataSourcesArray.forEach(element => {
            if (element.startsWith(_fromStorString + " ")) {
              this.selectedSolarPowerDatapoint = <string>element;
            }
          });
        }
      })
      .catch((err) => {
        console.error("Error initSolarPowerSourceSelector");
        console.error(err);

        this.selectedSolarPowerDatapoint = "";
      })
  }

  private initAdditionalPowerSourceSelector() {

    //If dataSourcesArray not initialized then call again with timeout
    if (undefined === this.dataSourcesArray || null === this.dataSourcesArray || 0 === this.dataSourcesArray.length) {
      setTimeout(() => {
        this.initAdditionalPowerSourceSelector();
      }, 100);
      return;
    }

    return this.storage.get(ADDITIONAL_POWER_DATAPOINT_KEY)
      .then((_fromStor) => {
        if (null !== _fromStor) {
          var _fromStorString = <string>_fromStor;

          //Look up the datapoint including the value
          this.dataSourcesArray.forEach(element => {
            if (element.startsWith(_fromStorString + " ")) {
              this.selectedAdditionalPowerDatapoint = <string>element;
            }
          });
        }
      })
      .catch((err) => {
        console.error("Error initAdditionalPowerSourceSelector");
        console.error(err);

        this.selectedAdditionalPowerDatapoint = "";
      })
  }

  //#endregion

  private checkForLoginState() {

    if (undefined !== this.storage) {
      this.storage.get(LOGGED_IN_KEY)
        .then((valLoggedIn) => {
          if (true === valLoggedIn) {
            this.storage.get(DISPLAY_NAME_KEY)
              .then((valName) => {
                this.displayName = valName;
                this.loggedIn = true;
              })
              .catch(() => {
                this.loggedIn = false;
                this.displayName = "";
              })
          }
          else {
            this.loggedIn = false;
            this.displayName = "";
          }
        });
    }

    setTimeout(this.checkForLoginState, 1000);
  }

  private doLogout() {
    this.storage.set(LOGGED_IN_KEY, false);
    this.storage.set(DISPLAY_NAME_KEY, "");
    this.storage.set(COOKIES_KEY, []);

    this.checkForLoginState();
  }

  //#region Get CMIs

  private getCMIs() {

    const cmiListUrl = "https://cmi.ta.co.at/portal/geraete/getDevice.php?mode=0&order_dir=asc&order_column=2&search_value=&start=0";
    const cmiRowClassName = "ta-cmi-serial";

    var cmiListLocal: string[] = [];

    //Clear cookies
    this.http.clearCookies();

    //Set credential cookies
    return this.storage.get(COOKIES_KEY)
      .then((val) => {
        var tmpCookies: string[] = val;

        tmpCookies.forEach(element => {
          this.http.setCookie("https://cmi.ta.co.at/", element);
        });

        //Get the data
        this.http.get(cmiListUrl, {}, {})
          .then(data => {
            //Parse the received user data page to a JSON Element
            let j = JSON.parse(data.data);

            //Push every ID to the CMI List
            j.data.forEach(element => {
              cmiListLocal.push(element["id"]);
            });

            this.storage.set(CMI_LIST_KEY, cmiListLocal);
            this.updateCMIListFromStorage();
          })
          .catch((err) => {
            console.error("Error getting Page in getCMIs");
            console.error(err);

            this.errorHandlingGetCMIs(err);
          })
      })
      .catch((err) => {
        console.error("Error getting cookies in getCMIs");
        console.error(err);

        this.errorHandlingGetCMIs(err);
      })

  }

  private errorHandlingGetCMIs(err) {
    this.storage.set(CMI_LIST_KEY, []);
    this.storage.set(SELECTED_CMI_KEY, "");
    this.updateCMIListFromStorage();
  }

  private updateCMIListFromStorage() {
    this.storage.get(CMI_LIST_KEY)
      .then((val) => {
        this.CMIList = val;

        //If the CMI select dropdown is empty then select the first CMI
        if (undefined !== this.CMIList && 0 < this.CMIList.length) {
          if (undefined === this.selectedCMI || 0 === this.selectedCMI.length) {
            this.selectedCMI = this.CMIList[0];
          }
          //Check if the currently selected CMI is not in the List, then also apply first element
          else {
            if (!this.CMIList.includes(this.selectedCMI)) {
              this.selectedCMI = this.CMIList[0];
            }
          }
        }

      })
      .catch((err) => {
        console.error("Error updateCMIListFromStorage");
        console.error(err);

        this.CMIList = [];
      })
  }

  private selectedCMIChanged(event) {
    //Update in storage
    this.storage.set(SELECTED_CMI_KEY, this.selectedCMI);
  }

  //#endregion


  private getSchema() {
    this.schemaGetter.getDataSourceArray(this);
    return;
  }

  //#region Data Sources

  private selectedSolarPowerDatapointChanged(event) {
    //Crop the text away --> take only the div id
    var datapointID: string = this.selectedSolarPowerDatapoint.split(" - ")[0];

    //Update in storage
    this.storage.set(SOLAR_POWER_DATAPOINT_KEY, datapointID);
  }

  private selectedAdditionalPowerDatapointChanged(event) {
    //Crop the text away --> take only the div id
    var datapointID: string = this.selectedAdditionalPowerDatapoint.split(" - ")[0];

    //Update in storage
    this.storage.set(ADDITIONAL_POWER_DATAPOINT_KEY, datapointID);
  }

  private hwbChanged() {
    this.hwbArray = [
      this.hwb01,
      this.hwb02,
      this.hwb03,
      this.hwb04,
      this.hwb05,
      this.hwb06,
      this.hwb07,
      this.hwb08,
      this.hwb09,
      this.hwb10,
      this.hwb11,
      this.hwb12];

    //Update in storage
    this.storage.set(EAW_HWB_ARRAY_KEY, this.hwbArray);
  }

  private fillLocalHWBfromStorage(hwbArrayFromStorage) {
    this.hwb01 = hwbArrayFromStorage[0];
    this.hwb02 = hwbArrayFromStorage[1];
    this.hwb03 = hwbArrayFromStorage[2];
    this.hwb04 = hwbArrayFromStorage[3];
    this.hwb05 = hwbArrayFromStorage[4];
    this.hwb06 = hwbArrayFromStorage[5];
    this.hwb07 = hwbArrayFromStorage[6];
    this.hwb08 = hwbArrayFromStorage[7];
    this.hwb09 = hwbArrayFromStorage[8];
    this.hwb10 = hwbArrayFromStorage[9];
    this.hwb11 = hwbArrayFromStorage[10];
    this.hwb12 = hwbArrayFromStorage[11];
  }

  private pebskChanged() {
    //Update in storage
    this.storage.set(EAW_PEBSK_KEY, this.pebskCalced);
  }

  private co2skChanged() {
    //Update in storage
    this.storage.set(EAW_CO2SK_KEY, this.co2skCalced);
  }

  private bgfChanged() {
    //Update in storage
    this.storage.set(EAW_BGF_KEY, this.bgfCalced);
  }

  //#endregion
}
