import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { PeerService } from 'src/app/services/peer.service';
import { ActivatedRoute } from '@angular/router';
import { Message } from 'src/app/interfaces/messsage.interface';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { MediaConnection } from 'peerjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo') localVideo!: ElementRef;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef;

  messages: Message[] = [];
  newMessage = '';
  currentPeerId = '';
  myId: string = '';
  incomingCall: any | null = null;
  localStream: MediaStream | null = null;
  remoteStream!: MediaStream;
  currentCall : MediaConnection | null = null
  private authSubscription!: Subscription;

  constructor(
    private peerService: PeerService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.myId = user ? user.peerId : '';
    });

    this.route.queryParams.subscribe(params => {
      const selectedUserPeerId = params['peerId'];
      console.log(selectedUserPeerId);
      if (selectedUserPeerId) {
        this.currentPeerId = selectedUserPeerId;
        this.peerService.connectToPeer(this.currentPeerId);
      }
    });

    this.messages = this.peerService.getMessages();
    this.peerService.getRemoteStreamObservable().subscribe((stream) => {
      if (stream) {
        this.handleRemoteStream(stream);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  handleRemoteStream(remoteStream: MediaStream) {
    this.remoteStream = remoteStream;
    this.remoteVideo.nativeElement.srcObject = remoteStream;
    this.remoteVideo.nativeElement.play().catch((err: any) => console.error('Error playing video:', err));
  }

  sendMessage() {
    if (this.newMessage.trim() === '') return;
    const message: Message = {
      sender: this.myId,
      receiver: this.currentPeerId,
      timedate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      data: this.newMessage
    };

    this.peerService.sendData(this.currentPeerId, message);
    this.newMessage = '';
    this.messages.push(message);
  }

  initiateCall() {
    if (!this.currentPeerId) {
      console.error('No Peer selected to call');
      return;
    }
  
    this.peerService.getUserMedia().then((localStream) => {
      this.localStream = localStream;
      this.localVideo.nativeElement.srcObject = localStream;
      this.localVideo.nativeElement.muted = true;
      
      this.peerService.initiateCall(this.currentPeerId)
        .then(call => {
          this.currentCall = call; // Assign the call object to this.currentCall
          console.log('Call initiated successfully: ' + this.currentPeerId);
        })
        .catch(err => {
          console.error('Failed to initiate call:', err);
          // Consider adding cleanup or state update logic here
        });
    }).catch(err => {
      console.error('Failed to get user media:', err);
      
    });
  }
  
  endCall() {
    if (this.currentCall) {
      this.peerService.endCall(this.currentCall);
      this.currentCall = null; // Reset the currentCall to null after ending the call
      
      // Turn off the local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null; // Reset the localStream to null after stopping all tracks
      }
      
    } else {
      console.error('No current call to end');
    }
  }
  
}
