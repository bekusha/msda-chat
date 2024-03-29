import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SignallingService } from './services/signalling.service';
import { User } from './interfaces/user.interface';
import { FriendrequestdialogComponent } from './components/friendrequestdialog/friendrequestdialog.component';
import { PeerService } from './services/peer.service';
import { CallNotificationComponent } from './components/call-notification/call-notification.component';
import { Router } from '@angular/router';
import { CallData } from './interfaces/callData.interface';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'messenger';
  private caller!: User

  constructor(
    private signalingService: SignallingService,
    private peerService: PeerService,
    private dialog: MatDialog,
    private router: Router,
    
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
          console.log(callData)
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

  ngOnDestroy(): void {
 this.signalingService.logOut()
 
    
  }

  private handleIncomingCall(callData: CallData) {
    this.signalingService.listenForIncomingCall().subscribe((data)=>{
    
      this.caller = data.userData
      console.log(this.caller);
      callData.user = this.caller
      console.log(callData.user)
      const dialogRef = this.dialog.open(CallNotificationComponent, {
        maxWidth: '100vw',
        maxHeight: '100vh',
        width: '80%',
        height: 'auto',
        data: callData
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
    })
 
    

 
  }




  openFriendRequestDialog(user:User){
    console.log(user.peerId)
    const dialogRef = this.dialog.open(FriendrequestdialogComponent, {
      data: user
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
