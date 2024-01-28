import { Component, ElementRef, ViewChild } from '@angular/core';
import { PeerService } from '../peer.service';
import { ActivatedRoute } from '@angular/router'; 
import { Message } from '../interfaces/messsage.interface';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {

  @ViewChild('localVideo') localVideo!: ElementRef;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef;
  
  messages:Message[] = []
  newMessage = ''
  currentPeerId = ''
 myId: string = '';
 incomingCall: any | null = null; 
 localStream!: MediaStream;
 remoteStream!: MediaStream;

  constructor(private peerService: PeerService, private route: ActivatedRoute){
    // this.getLocalStream().then(localStream => {
    //   this.localStream = localStream;
    //   this.localVideo.nativeElement.srcObject = localStream;
    //   this.localVideo.nativeElement.muted = true;
    // }).catch(error => {
    //   console.error('Failed to initialize local stream:', error);
    //   // Handle errors if necessary
    // });
  }

  ngOnInit(): void {
    this.myId = this.peerService.getMyId()
    this.route.queryParams.subscribe(params => {
      const selectedUserPeerId = params['peerId'];
      console.log(selectedUserPeerId)
      if(selectedUserPeerId){
        this.currentPeerId = selectedUserPeerId
      }
    })
    this.messages = this.peerService.getMessages();
    this.peerService.getRemoteStreamObservable().subscribe((stream) => {
      if (stream) {
        this.handleRemoteStream(stream);
      } else {
        // Handle stream being null (e.g., call ended)
      }
    });
    

  }

 
 

  handleRemoteStream(remoteStream: MediaStream) {
    this.remoteStream = remoteStream;
    this.remoteVideo.nativeElement.srcObject = remoteStream;
    this.remoteVideo.nativeElement.play().catch((err: any) => console.error('Error playing video:', err));
  }

  sendMessage(){
   
    if(this.newMessage.trim() === '')return;
    const message: Message = {
      sender: this.peerService.getMyId(),
      receiver: this.currentPeerId,
      timedate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      data: this.newMessage
    }
    
    this.peerService.sendData(this.currentPeerId, message)
    this.newMessage = ''
    this.messages.push(message)

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
      this.peerService.initiateCall(this.currentPeerId).then(call => {
        console.log('Call initiated successfully: ' + this.currentPeerId);
      }).catch(err => console.error('Failed to initiate call:', err));
    });
  }


 


}
