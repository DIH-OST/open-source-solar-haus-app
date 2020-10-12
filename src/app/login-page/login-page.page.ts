import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { HTTP } from '@ionic-native/http/ngx';
import { Storage } from '@ionic/storage';

import { ToastHelper } from "../helpers/toast-helper";

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.page.html',
  styleUrls: ['./login-page.page.scss'],
})
export class LoginPagePage implements OnInit {

  private cookiesLocal: string[];
  private displayNameLocal: string;
  private loggedInLocal: boolean;

  private username: string;
  private password: string;

  private loginButtonEnabled: boolean;

  private toastHelper: ToastHelper;

  constructor(private http: HTTP, private storage: Storage, private navCtrl: NavController) {
    this.cookiesLocal = [];
    this.displayNameLocal = "";
    this.loggedInLocal = false;

    this.username = "";
    this.password = "";

    this.loginButtonEnabled = false;

    this.toastHelper = new ToastHelper();
  }

  //#region Initialization

  async ngOnInit() {

    await this.storage.get("loggedIn")
      .then((val) => {
        if (null === val) {
          this.loggedInLocal = false;
          this.storage.set("loggedIn", false);
        }
        else if (true === val) {
          this.loggedInLocal = true;
        }
        else {
          this.loggedInLocal = false;
        }
      })

    //If not logged in clean up
    if (false === this.loggedInLocal) {
      this.cookiesLocal = [];
      this.displayNameLocal = "";

      this.storage.set("displayName", "");
      this.storage.set("cookies", []);
    }
    //Else get Name and Cookies from the Storage
    else {
      await this.storage.get("displayName")
        .then((val) => {
          this.displayNameLocal = val;
        })

      await this.storage.get("cookies")
        .then((val) => {
          this.cookiesLocal = val;
        })
    }
  }
  ionViewDidEnter() {
    this.checkIfLoginButtonEnabled()
  }

  //#endregion

  //#region HTTP Communication

  private getLoginPage() {

    const loginPageUrl = "https://cmi.ta.co.at/portal/ta/loginformular/";

    var promise = this.http.get(loginPageUrl, {}, {})
      .then(data => {
        //This request return the "PHPSESSID" and the "cooklang" cookies, they are added to the global cookielist
        var _cookieString: string = this.http.getCookieString("https://cmi.ta.co.at/");
        var _cookies = _cookieString.split("; ");

        _cookies.forEach(element => {
          this.http.setCookie("https://cmi.ta.co.at/", element);
          this.cookiesLocal.push(element);
        });
      });

    return promise;
  }

  private checkLogin(username: string, password: string) {

    //Todo: Toast an specific alert if password or name wrong

    const checkLoginUrl = "https://cmi.ta.co.at/portal/checkLogin.inc.php?mode=ta";

    var formdata = {
      username: username,
      passwort: password
    }

    this.http.setDataSerializer('urlencoded');
    this.http.setHeader('*', 'Content-Type', 'application/x-www-form-urlencoded');

    var promise = this.http.post(checkLoginUrl, formdata, {})
      .then(data => {
        //This request return the "csrf_token", this is added to the global cookielist
        var cookieString: string = this.http.getCookieString("https://cmi.ta.co.at/");
        var tmpCookies = cookieString.split("; ");

        tmpCookies.forEach(element => {
          if (element.includes("csrf_token")) {
            this.cookiesLocal.push(element);
          }
        });
      });

    return promise;
  }

  private checkIfLoginIsOkAndGetDisplayName() {

    const userDataUrl = "https://cmi.ta.co.at/portal/ta/konto/";

    var firstName: String = "";
    var lastName: String = "";

    //Clear cookies
    this.http.clearCookies();

    //Set credential cookies
    this.cookiesLocal.forEach(element => {
      this.http.setCookie("https://cmi.ta.co.at/", element);
    });

    var promise = this.http.get(userDataUrl, {}, {})
      .then(data => {
        //Parse the received user data page to a HTML Element
        var parser = new DOMParser();
        var doc = parser.parseFromString(data.data, 'text/html');

        firstName = doc.getElementById("vorname").getAttribute("value");
        lastName = doc.getElementById("nachname").getAttribute("value");

        this.displayNameLocal = firstName + " " + lastName;
        this.loggedInLocal = true;
      });

    return promise;
  }

  //#endregion

  public doLogin() {

    this.http.clearCookies();
    this.cookiesLocal = [];

    this.getLoginPage().then(() => {
      this.checkLogin(this.username, this.password).then(() => {
        this.checkIfLoginIsOkAndGetDisplayName().then(() => {

        })
          .catch((err) => {
            console.error("Login error - checkIfLoginIsOkAndGetDisplayName!");
            console.error(err);

            this.displayNameLocal = "";
            this.cookiesLocal = [];
            this.loggedInLocal = false;
          })
          .finally(() => {
            if (this.loggedInLocal) {
              this.toastHelper.presentToast("Willkommen, " + this.displayNameLocal + "!", "success");

              //Redirect to home
              this.navCtrl.navigateForward("/tabs/more");
            }
            else {
              this.toastHelper.presentToast("Login leider nicht erfolgreich!", "danger");
            }

            this.storage.set("displayName", this.displayNameLocal);
            this.storage.set("cookies", this.cookiesLocal);
            this.storage.set("loggedIn", this.loggedInLocal);
          });
      })
        .catch((err) => {
          console.error("Login error - checkLogin!");
          console.error(err);

          this.displayNameLocal = "";
          this.cookiesLocal = [];
          this.loggedInLocal = false;
        })
    })
      .catch((err) => {
        console.error("Login error - getLoginPage!");
        console.error(err);

        this.displayNameLocal = "";
        this.cookiesLocal = [];
        this.loggedInLocal = false;
      })

  }

  private checkIfLoginButtonEnabled() {

    if (0 < this.username.length && 0 < this.password.length) {
      this.loginButtonEnabled = true;
    }
    else {
      this.loginButtonEnabled = false;
    }

  }
}
