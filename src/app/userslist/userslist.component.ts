import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { User } from '../interfaces/user.interface';

import { SignallingService } from '../signalling.service';
import { PeerService } from '../peer.service';

@Component({
  selector: 'app-userslist',
  templateUrl: './userslist.component.html',
  styleUrls: ['./userslist.component.css']
})
export class UserslistComponent {
  public allUsers: User[] | null = []
constructor(private authService: AuthService, private signalingService: SignallingService,private peerService: PeerService){
  
}
ngOnInit(): void {
  this.signalingService.listen('users-list').subscribe((usersData: User[])=>{
    this.allUsers = usersData
    console.log('Updated users list:', this.allUsers)
  })
  
}

sendFriendRequest(selectedPeerId: string): void{
  this.signalingService.emitFriendRequest(selectedPeerId)
  this.peerService.connectToPeer(selectedPeerId)
}

logout(){

}

}
