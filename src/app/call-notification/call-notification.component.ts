import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PeerService } from '../peer.service';
import { CallData } from '../interfaces/callData.interface';

@Component({
  selector: 'app-call-notification',
  templateUrl: './call-notification.component.html',
  styleUrls: ['./call-notification.component.css']
})
export class CallNotificationComponent implements OnInit {

  @ViewChild('localVideo') localVideo!: ElementRef;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef;
  


constructor(
  @Inject(MAT_DIALOG_DATA)
  public data: CallData, 
  private dialogRef:MatDialogRef<CallNotificationComponent>,
  private peerService: PeerService){
 
}

callAccepted: boolean = false;
localStream! : MediaStream
remoteStream!: MediaStream;


ngOnInit(): void {
  
  // navigator.mediaDevices
  //   .getUserMedia({ video: true, audio: true }) // You can specify the constraints as needed
  //   .then((stream) => {
  //     this.localStream = stream;
  //     this.attachVideo(this.localVideo.nativeElement, this.localStream);
  //   })
  //   .catch((error) => {
  //     console.error('Error accessing local media:', error);
  //   });
}


private attachVideo(videoElement: HTMLVideoElement, stream: MediaStream) {
  videoElement.srcObject = stream;
  videoElement.onloadedmetadata = () => {
    videoElement.play().catch(err => console.error('Error playing video:', err));
  };
}

onNoClick(): void {
  this.dialogRef.close();
}

acceptCall(): void {
  console.log('Accepting Call: ' + this.data.call.peer);

  this.peerService.getUserMedia().then((localStream) => {
    this.attachVideo(this.localVideo.nativeElement, localStream);
    this.localStream = localStream;
  
    this.peerService.answerCall(this.data.call).then((remoteStream) => {
    
      this.attachVideo(this.remoteVideo.nativeElement, remoteStream);
      this.remoteStream = remoteStream;
      this.callAccepted = true;
    }).catch((err) => {
      console.error('Error answering call:', err);
      this.dialogRef.close({ callAccepted: false, error: err });
    });
  }).catch((err) => {
    console.error('Error getting local media:', err);
    this.dialogRef.close({ callAccepted: false, error: err });
  });
}

rejectCall(): void {
  console.log('Rejecting call:', this.data.call);
  this.dialogRef.close();
}

}
