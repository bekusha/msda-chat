import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SignallingService } from 'src/app/services/signalling.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/interfaces/user.interface';

@Component({
  selector: 'app-friendrequestdialog',
  templateUrl: './friendrequestdialog.component.html',
  styleUrls: ['./friendrequestdialog.component.css']
})
export class FriendrequestdialogComponent {
  constructor(
    public dialogRef: MatDialogRef<FriendrequestdialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User,
    private signalingService: SignallingService,
    private authService: AuthService
  ) {
    console.log(this.data);
  }

  acceptFriendRequest() {
    this.authService.currentUser$.subscribe(currentUser => {
      if (currentUser && currentUser.peerId) {
        const receiverUuid = currentUser.peerId;
        this.signalingService.emitFriendRequestAccepted(this.data.peerId, receiverUuid);
        this.dialogRef.close(true);
        console.log('Dialog accepted: ' + this.data.peerId + ' ' + receiverUuid);
      } else {
        console.log('No current user or peerId found');
      }
    });
  }

  rejectFriendRequest() {
    this.signalingService.emitFriendRequestRejected(this.data.peerId);
    this.dialogRef.close(false);
    console.log('Dialog rejected');
  }
}
