import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SignallingService } from './services/signalling.service';
import { User } from './interfaces/user.interface';
import { FriendrequestdialogComponent } from './friendrequestdialog/friendrequestdialog.component';
import { PeerService } from './services/peer.service';
import { CallNotificationComponent } from './call-notification/call-notification.component';
import { Router } from '@angular/router';
import { CallData } from './interfaces/callData.interface';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'messenger';
  

  constructor(
    private signalingService: SignallingService,
    private peerService: PeerService,
    private dialog: MatDialog,
    private router: Router
  ){
   
   
  }

  ngOnInit(): void {
    this.signalingService.listenForFriendRequest().subscribe((request: any) => {
      this.openFriendRequestDialog(request.from);
      console.log(request)
    })
  
    this.peerService.getCallStream().subscribe((callData: CallData) => {
      console.log('Call event received:', callData);
      
      switch (callData.status) {
        case 'incoming':
          this.handleIncomingCall(callData);
          
          break;
        case 'connected':
          if (callData.stream) {
            console.log(callData.stream)
            this.peerService.setRemoteStream(callData.stream);
          }
          break;
        case 'closed':
          this.peerService.setRemoteStream(null)
          break;
        case 'error':
          // Handle errors
          break;
      }
    });



    
  }

  private handleIncomingCall(callData: CallData) {
    console.log(`Incoming call from ${callData.callerId}`);
    const dialogRef = this.dialog.open(CallNotificationComponent, {
      width: '250px',
      data: callData // Pass the callData to your dialog component
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed. Result:', result);
      if (result && result.callAccepted) {
        console.log('Call accepted by the user.');
        // Here you can handle call acceptance, e.g., show the video call interface
      } else {
        console.log('Call rejected or dismissed by the user.');
        // Here you can handle call rejection or dismissal
      }
    });
  }




  openFriendRequestDialog(user:User){
    console.log(user.peerId)
    const dialogRef = this.dialog.open(FriendrequestdialogComponent, {
      data: {peerId: user.peerId}
    })

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        console.log(`Friend request accepted by ${user.peerId} + ${user}`);
        
        this.signalingService.addFriend(user);
        // dialogRef.close(true)

      } else if (result === false) {
        console.log(`Friend request rejected by ${user.peerId}`);
      }
    });
    
  }
}
