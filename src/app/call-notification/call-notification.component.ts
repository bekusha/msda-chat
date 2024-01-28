import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PeerService } from '../peer.service';
import { CallData } from '../interfaces/callData.interface';

@Component({
  selector: 'app-call-notification',
  templateUrl: './call-notification.component.html',
  styleUrls: ['./call-notification.component.css']
})
export class CallNotificationComponent implements OnInit {
constructor(@Inject(MAT_DIALOG_DATA) public data: CallData, private dialogRef:MatDialogRef<CallNotificationComponent>,
private peerService: PeerService){
 
}

ngOnInit(): void {
  
}

onNoClick(): void {
  this.dialogRef.close();
}

acceptCall(): void {
  console.log('Acceptin Call: ' + this.data.call)
  this.peerService.answerCall(this.data.call).then(()=>{
    this.dialogRef.close({ callAccepted: true })
  }).catch((err: string) => {
    console.error('Error answering call: ' + err)
    this.dialogRef.close({ callAccepted: false, error: err })
  })
}

rejectCall(): void {
  console.log('Rejecting call:', this.data.call);
  this.dialogRef.close();
}

}
