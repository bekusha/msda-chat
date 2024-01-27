import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { User } from '../interfaces/user.interface';
import { Router } from '@angular/router';
import { PeerService } from '../peer.service';
import { SignallingService } from '../signalling.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  user: User = {
    name : '',
    lastName: '',
    username: '',
    peerId: ''
  }

  constructor(
    private authService: AuthService,
    private peerService: PeerService,
    private router: Router,
    private signalingService: SignallingService
    ){}
login(){
  const peerId = this.peerService.getMyId()
 if(peerId){
  this.user.peerId = peerId;
  this.authService.login(this.user)
  this.router.navigate(['userslist'])
 
  console.log(this.user)
 }else{
  console.error('Peer ID is not available. Cannot proceed with login.')
 }
  
}
  

}
