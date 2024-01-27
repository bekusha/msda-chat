import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SignallingService } from '../signalling.service';


@Component({
  selector: 'app-friendrequestdialog',
  templateUrl: './friendrequestdialog.component.html',
  styleUrls: ['./friendrequestdialog.component.css']
})
export class FriendrequestdialogComponent {

  constructor(
    public dialogref: MatDialogRef<FriendrequestdialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private signalingService: SignallingService
  ){}

  acceptFriendRequest(){
    const receiverUuid = this.signalingService.getCurrentUserUuid()
    this.signalingService.emitFriendRequestAccepted(this.data.peerId, receiverUuid!)
    this.dialogref.close(true)
    console.log('dialog accepted')
  }

  rejectFriendRequest(){
    this.signalingService.emitFriendRequestRejected(this.data.peerId)
    this.dialogref.close(false);
    console.log('dialog rejected')
  }

}
