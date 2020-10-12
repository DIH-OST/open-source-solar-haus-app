import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http/ngx';

import { LOGGED_IN_KEY, DISPLAY_NAME_KEY, COOKIES_KEY, CMI_LIST_KEY, SELECTED_CMI_KEY, SOLAR_POWER_DATAPOINT_KEY, ADDITIONAL_POWER_DATAPOINT_KEY } from '../database-keys/database-keys';

import { GetterReturnTemplate } from '../helpers/getter-return-template';

export class SchemaGetter {

    constructor(private http: HTTP, private storage: Storage) { }

    //Get all available Data Sources (--> all divs with id "posXX" and only text as content)
    public getDataSourceArray(callerRef: GetterReturnTemplate) {

        this.storage.get(SELECTED_CMI_KEY)
            .then((val) => {

                var valStr: string = <string>val;

                // https://cmi019257.cmi.ta.co.at/webi/schema.html
                const cookieUrl = "https://" + valStr.toLowerCase() + ".cmi.ta.co.at";
                const schemaUrl = cookieUrl + "/webi/schematic_files/1.cgi";

                //Set credential cookies
                this.storage.get(COOKIES_KEY)
                    .then((val) => {
                        var tmpCookies: string[] = val;

                        //Only set cookies if there are some
                        if (null !== tmpCookies || 0 !== tmpCookies.length) {
                            tmpCookies.forEach(element => {
                                this.http.setCookie(cookieUrl, element);
                            });
                        }
                        else {
                            //If there are no cookies nothing can be got
                            return;
                        }

                        this.http.get(schemaUrl, {}, {})
                            .then(data => {
                                //Parse the received user data page to a HTML Element
                                var parser = new DOMParser();
                                var doc = parser.parseFromString(data.data, 'text/html');

                                callerRef.dataSourcesArray = [];

                                //Get all data value elements
                                for (let index = 0; index < doc.body.children.length; index++) {
                                    const element = doc.body.children[index];

                                    //Take only plain-text elements --> childElementCount === 0
                                    if (0 === element.childElementCount) {

                                        callerRef.dataSourcesArray.push(
                                            <string>element.id + " - \"" + <string>element.innerHTML.trim() + "\""
                                        );
                                    }
                                }
                            });
                    });
            })
            .catch((err) => {
                console.error("Error getSchema");
                console.error(err);
            })
    }

    public getSolarPower(callerRef: GetterReturnTemplate) {
        this.storage.get(SELECTED_CMI_KEY)
            .then((val) => {

                var valStr: string = <string>val;

                // https://cmi019257.cmi.ta.co.at/webi/schema.html
                const cookieUrl = "https://" + valStr.toLowerCase() + ".cmi.ta.co.at";
                const schemaUrl = cookieUrl + "/webi/schematic_files/1.cgi";

                this.storage.get(SOLAR_POWER_DATAPOINT_KEY)
                    .then((datapointKey) => {
                        //Set credential cookies
                        this.storage.get(COOKIES_KEY)
                            .then((val) => {
                                var tmpCookies: string[] = val;

                                tmpCookies.forEach(element => {
                                    this.http.setCookie(cookieUrl, element);
                                });

                                this.http.get(schemaUrl, {}, {})
                                    .then(data => {
                                        //Parse the received user data page to a HTML Element
                                        var parser = new DOMParser();
                                        var doc = parser.parseFromString(data.data, 'text/html');

                                        callerRef.solarPowerString = doc.getElementById(datapointKey).textContent;
                                    })
                                    .catch(err => {
                                        console.error("Error in getSolarPower getting page");
                                        console.error(err.toString());
                                        //Check if it is an non logged in error
                                        if (err && err.status && 401 == err.status) {
                                            console.error("401 Error in getSolarPower getting page - Not logged in");

                                            //Logging out
                                            this.storage.set(LOGGED_IN_KEY, false);
                                            this.storage.set(COOKIES_KEY, []);
                                            this.storage.set(DISPLAY_NAME_KEY, "");
                                        }
                                    })

                            });

                    });
            })
            .catch((err) => {
                console.error("Error getSchema");
                console.error(err);

                callerRef.solarPowerString = "";
            })
    }
} 
