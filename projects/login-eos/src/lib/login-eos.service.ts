import { Injectable, EventEmitter, Inject } from '@angular/core';
import { ToastaService, ToastaConfig, ToastOptions, ToastData } from 'ngx-toasta';
import { configInterface, configNetworkService } from './login-config.service';

@Injectable({
  providedIn: 'root'
})
export class LoginEOSService {
  
  WINDOW: any = window;
  eos: any = this.WINDOW.Eos(this.config.Eos);
  loggedIn: any = new EventEmitter<boolean>();
  accountName: any;
  ScatterJS: any;

  constructor(private toastyService: ToastaService,
              private toastyConfig: ToastaConfig,
              @Inject(configNetworkService) private config) {
     this.WINDOW.ScatterJS.plugins(new this.WINDOW.ScatterEOS());
     this.toastyConfig.position = 'top-right';
     this.toastyConfig.theme = 'material';
     this.config = {
          network : {
              blockchain: this.config.blockchain,
              host: this.config.host,
              port: this.config.port,
              protocol: this.config.protocol,
              expireInSeconds: this.config,
              chainId: this.config.chain
          },
          Eos: {
            httpEndpoint: this.config.httpEndpoint,
            chainId: this.config.chain,
            verbose: this.config.verbose
          },
     };
  }

  initScatter() {
    this.WINDOW.ScatterJS.scatter.connect(this.config.appName).then(connected => {
      if (!connected) {
          return this.showScatterError('Can\'t connect to Scatter');
      }
      this.ScatterJS        = this.ScatterJS.scatter;
      this.WINDOW.scatter   = null;
      this.WINDOW.ScatterJS = null;
      this.eos              = this.ScatterJS.eos(this.config.network, this.WINDOW.Eos, { chainId: this.config.chain }, this.config.network.protocol);

      this.ScatterJS.getIdentity({ accounts: [this.config.network] }).then(identity => {
              if (identity.accounts.length === 0) {
                  return;
              }
              let objectIdentity;
              if (this.ScatterJS.identity && this.ScatterJS.identity.accounts) {
                     objectIdentity = this.ScatterJS.identity.accounts.find(x => x.blockchain === 'eos');
              }
              objectIdentity   = { name: identity.accounts[0].name };
              this.accountName = objectIdentity.name;
              localStorage.setItem('user', 'connected');
              localStorage.setItem('account', this.accountName);
      
              this.loggedIn.emit(true);
              this.showMessage(`Hi ${this.accountName} :)`);
      }).catch(error => this.showScatterError(error));
    }).catch(error => {
        this.showScatterError(error);
    });
  }

  showScatterError(error) {
    if (!error) return;
    let msg = error.message;

    if (error.type == 'account_missing' && error.code == 402 ) {
        msg = 'Missing required accounts, repull the identity. Choose account the same as added in Scatter.';
    } else if (error.type == 'identity_rejected' && error.code == 402 ) {
        msg = 'Please accept Identity request';
    } else if (error.type == 'locked' && error.code == 423 ) {
        msg = 'Your Scatter wallet is locked';
    } else if (error.type == 'signature_rejected' && error.code == 402 ) {
        msg = 'Voting Transaction canceled (you rejected signature request)';
    } else if (error.code == 500) {
    	msg = 'You can\'t close game in the middle';
    }
    const toastOption: ToastOptions = {
         title: 'Error',
         msg: msg,
         showClose: true,
         timeout: 2000,
         theme: 'material'
    };
    this.toastyService.wait(toastOption);
  }

  showMessage(msg) {
      const toastOption: ToastOptions = {
         title: '',
         msg: msg,
         showClose: true,
         timeout: 1500,
         theme: 'material'
      };
      this.toastyService.wait(toastOption);
  }

  logout() {
    localStorage.setItem('user', 'disconnect');
    this.ScatterJS.scatter.forgetIdentity().then(() => {
          localStorage.setItem('account', '');
          location.href = '/';
    }).catch(err => {
          console.error(err);
    });
  }

// ==== service end
}





