import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { User } from '../interfaces/user.interface';
import { MatDialog } from '@angular/material/dialog';
import { SignallingService } from '../signalling.service';
import { PeerService } from '../peer.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-userslist',
  templateUrl: './userslist.component.html',
  styleUrls: ['./userslist.component.css']
})
export class UserslistComponent {

  public allUsers: User[] | null = []
  public friendsList: User[] | null = []
constructor(
  
  private signalingService: SignallingService,
  private peerService: PeerService,  
  private router : Router
 ){

}
ngOnInit(): void {
  // Subscribe to get the list of all users
  this.signalingService.listen('users-list').subscribe((usersData: User[]) => {
    this.allUsers = usersData;
    console.log('Updated users list:', this.allUsers);
  });

  // Subscribe to get the initial friends list and updates
  this.signalingService.getFriendsListObservable().subscribe((friendsData: User[]) => {
    this.friendsList = friendsData;
    console.log('Current friends list:', this.friendsList);
  });

  // Listen for updates to the friends list and add the new friend
  this.signalingService.listenForFriendsListUpdate().subscribe((newFriend: User) => {
    if (this.friendsList && !this.friendsList.find(friend => friend.peerId === newFriend.peerId)) {
      this.friendsList.push(newFriend);
      console.log('Added new friend:', newFriend);
    }
  });
}


sendFriendRequest(selectedPeerId: string): void{
  this.signalingService.emitFriendRequest(selectedPeerId)
  this.peerService.connectToPeer(selectedPeerId)

}

selectUserForChat(selectedUserPeerId: string){
  this.router.navigate(['chat'], {queryParams: {peerId: selectedUserPeerId}})
}

logout(){

}

}
