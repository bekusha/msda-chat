import { Component } from '@angular/core';
import { PeerService } from '../peer.service';
import {  Router } from '@angular/router';

@Component({
  selector: 'app-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.css']
})
export class AppLayoutComponent {

  constructor(
   private peerService: PeerService,
   private router: Router
  ){}
  
  logout(){
    this.peerService.logout()
    this.router.navigate([''])
  }


}
