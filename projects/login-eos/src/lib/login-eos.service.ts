import { Injectable, EventEmitter, Inject } from '@angular/core';
import { ToastaService, ToastaConfig, ToastOptions, ToastData } from 'ngx-toasta';
import { configInterface, configNetworkService } from './login-config.service';

import ScatterJS from 'scatterjs-core';
import ScatterEOS from 'scatterjs-plugin-eosjs';
import Eos from 'eosjs';

ScatterJS.plugins( new ScatterEOS() );

@Injectable({
  providedIn: 'root'
})
export class LoginEOSService {
  
  connected = (localStorage.getItem('wallet') === 'connected') ? true : false; 
  eosConf = {
        httpEndpoint: this.config.httpEndpoint,
        chainId: this.config.chain,
        verbose: this.config.verbose
  }
  network = ScatterJS.Network.fromJson({
        blockchain: this.config.blockchain,
        host: this.config.host,
        port: this.config.port,
        protocol: this.config.protocol,
        expireInSeconds: this.config,
        chainId: this.config.chain
  });
  eos: any       = Eos(this.eosConf);
  ScatterJS: any = ScatterJS;
  loggedIn: any  = new EventEmitter<boolean>();
  accountName: any;
  options: any;
  initCounterErr = 0;

  constructor(private toastyService: ToastaService,
              private toastyConfig: ToastaConfig,
              @Inject(configNetworkService) private config) {
     this.toastyConfig.position = 'top-center';
     this.toastyConfig.theme = 'material';
  }

  initScatter() {
    this.ScatterJS.connect(this.config.appName, { network: this.network }).then(connected => {
      if (!connected) {
          if (this.initCounterErr < 2){
              this.initCounterErr += 1;
              return this.initScatter();
          }
          return this.showScatterError('Can\'t connect to Scatter');
      }
      this.eos = this.ScatterJS.eos(this.network, Eos);

      this.ScatterJS.login().then(id => {
              if(!id) return console.error('no identity');
              
              let account = ScatterJS.account('eos'); 
              this.accountName = account.name;
              this.options = {authorization:[`${account.name}@${account.authority}`]};

              localStorage.setItem('wallet', 'connected');
              localStorage.setItem('account', this.accountName);
      
              this.loggedIn.emit(true);
              this.connected = true;
              this.closePopUp();
              this.showMessage(`Hi ${this.accountName} :)`);

      }).catch(error => this.showScatterError(error));
    }).catch(error => {
        this.showScatterError(error);
    });
  }

  openPopup(){
      let popup = document.getElementById('popup-window');
      popup.setAttribute("class", "popup-window-visible");
      popup.addEventListener("click", (event: any) => {
        if (event.srcElement.className === 'popup-window-visible'){
             this.closePopUp();
        }
      });
  };

  closePopUp(){
      let popup = document.getElementById('popup-window');
      popup.removeAttribute("class");
  }

  showScatterError(error) {
    if (!error) { return; }
    let msg = error.message;
    if (error.type === 'identity_rejected'){
        location.reload();
    }
    const toastOption: ToastOptions = {
         title: 'Error',
         msg: msg || error,
         showClose: true,
         timeout: 3000,
         theme: 'material'
    };
    this.toastyService.error(toastOption);
  }

  contractError(err) {
      if (!err) {
         return;
      }
      if (!err.message){
        try{
            err = JSON.parse(err).error.details[0].message;
        } catch(e){
            console.log(e);
        }
      } else {
        err = err.message;
      }
      if (err.indexOf('requires a config.keyProvider') >= 0) err = 'Please, login Scatter first!';

      const toastOption: ToastOptions = {
         title: 'Error',
         msg: err,
         showClose: true,
         timeout: 5000,
         theme: 'material'
      };
      this.toastyService.error(toastOption);
  }

  showErr(err) {
      let error;
      try {
         error = JSON.parse(err);
      } catch (e) {
         console.error(e);
         error = err;
      }
      if (!error || !error.error || !error.error.details || !error.error.details[0]) {
         return;
      }
      const toastOption: ToastOptions = {
         title: 'Error',
         msg: error.error.details[0].message,
         showClose: true,
         timeout: 3000,
         theme: 'material'
      };
      this.toastyService.error(toastOption);
  }

  showMessage(msg) {
      const toastOption: ToastOptions = {
         title: '',
         msg: msg,
         showClose: true,
         timeout: 1500,
         theme: 'material'
      };
      this.toastyService.success(toastOption);
  }

  logout() {
    this.ScatterJS.forgetIdentity().then(() => {
          localStorage.setItem('account', '');
          localStorage.setItem('wallet', 'disconnect');
          location.href = '/';
    }).catch(err => {
          console.error(err);
    });
  }

// ==== service end
}





