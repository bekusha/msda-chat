import { Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../auth.service';
import { User } from '../interfaces/user.interface';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SignallingService } from '../signalling.service';
import { PeerService } from '../peer.service';
import { Router } from '@angular/router';
import { CallData } from '../interfaces/callData.interface';
import { CallNotificationComponent } from '../call-notification/call-notification.component';

@Component({
  selector: 'app-userslist',
  templateUrl: './userslist.component.html',
  styleUrls: ['./userslist.component.css']
})
export class UserslistComponent {

  @ViewChild('localVideo') localVideo!: ElementRef;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef;

  public allUsers: User[] | null = []
  public friendsList: User[] | null = []
  localStream!: MediaStream;
  
constructor(
  
  private signalingService: SignallingService,
  private peerService: PeerService,  
  private router : Router,
  private dialog : MatDialog
  
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

// initiateCall(currentPeerId:string) {
//   this.getLocalStream().then(localStream => {
//     this.peerService.initiateCall(currentPeerId).then(call => {
//       console.log('Call initiated successfully:', currentPeerId);
//       this.openCallDialog({
//         localStream: localStream,
//         stream: null, // Initially, there's no remote stream
//         call: call,
//         status: 'calling', // Custom status to indicate an outgoing call
//         callerId: currentPeerId
//       });
//     }).catch(err => console.error('Failed to initiate call:', err));
//   });
// }

openCallDialog(callData: CallData) {
  const dialogRef = this.dialog.open(CallNotificationComponent, {
    width: '350px',
    data: callData
  });

  dialogRef.afterClosed().subscribe(result => {
    console.log('The call dialog was closed');
    // Perform any additional cleanup if necessary
  });
}

async getLocalStream(): Promise<MediaStream> {
  try {
    const stream = await this.peerService.getUserMedia();
    this.localStream = stream; // Store the local stream in a component variable if needed
    // You can also attach the local stream to a video element for preview
    if (this.localVideo) {
      this.localVideo.nativeElement.srcObject = stream;
      this.localVideo.nativeElement.muted = true; // Mute the local video to avoid feedback
    }
    return stream;
  } catch (error) {
    console.error('Error getting user media:', error);
    throw error; // Rethrow the error so the caller knows the media request failed
  }
}

logout(){

}

}
