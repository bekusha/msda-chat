import { Component, ElementRef, ViewChild } from '@angular/core';
import { PeerService } from '../peer.service';
import { ActivatedRoute } from '@angular/router'; 
import { Message } from '../interfaces/messsage.interface';
// import { CallData } from '../interfaces/callData.interface';

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

  constructor(private peerService: PeerService, private route: ActivatedRoute){}

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
   
    // this.peerService.getCallStream().subscribe((callData: any) => {
    //   this.handleRemoteStream(callData.stream)
    // });
    // this.getLocalStream()

  }

 
    async getLocalStream(): Promise<MediaStream> {
    const stream = await this.peerService.getUserMedia();
      this.localStream = stream;
      this.localVideo.nativeElement.srcObject = stream;
      this.localVideo.nativeElement.muted = true;
      return stream;
  }

  handleRemoteStream(remoteStream: MediaStream) {
    this.remoteVideo.nativeElement.srcObject = remoteStream;
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




  

  initiateCall(){
    if(!this.currentPeerId){
      console.error('No Peer selected to call')
      return
    }
    this.peerService.initiateCall(this.currentPeerId).then(call=>{
      console.log('call initiated succesfully' + this.currentPeerId)
    }).catch(err => console.error('Failed to initiate call:', err));
  }


}
