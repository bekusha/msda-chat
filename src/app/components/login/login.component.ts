import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/interfaces/user.interface';
import { Router } from '@angular/router';
import { PeerService } from 'src/app/services/peer.service';
import { SignallingService } from 'src/app/services/signalling.service';


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

    ngOnInit(): void {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser && currentUser.peerId) {
        this.user = currentUser; // Use existing user data
        // if (!this.user.peerId) {
        //   // If the user doesn't have a peerId, assign a new UUID
        //   this.user.peerId = uuidv4();
        // }
      }
    }
    login() {
      this.authService.login(this.user);
      this.router.navigate(['userslist']);
      console.log(this.user);
    }
    

// login(){
//   const peerId = this.peerService.getMyId()
//  if(peerId){
//   this.user.peerId = peerId;
//   this.authService.login(this.user)
//   this.router.navigate(['userslist'])
 
//   console.log(this.user)
//  }else{
//   console.error('Peer ID is not available. Cannot proceed with login.')
//  }
  
// }
  

}
