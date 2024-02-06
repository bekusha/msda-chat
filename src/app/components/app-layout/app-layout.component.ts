import { Component } from '@angular/core';
import { PeerService } from 'src/app/services/peer.service';
import {  Router } from '@angular/router';
import { SignallingService } from 'src/app/services/signalling.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.css']
})
export class AppLayoutComponent {

  constructor(
   private peerService: PeerService,
   private router: Router,
   private signalingService: SignallingService,
   private authService: AuthService
  ){}
  
  logout(){
    this.peerService.logout()
    this.router.navigate([''])
    this.signalingService.logOut()
    this.authService.logout()
  }


}
