import { Component } from '@angular/core';
import { PeerService } from '../peer.service';
import { ActivatedRoute } from '@angular/router'; 
import { Message } from '../interfaces/messsage.interface';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  
  messages:Message[] = []
  newMessage = ''
  currentPeerId = ''
 myId: string = '';

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

    this.peerService.getMessageSubject().subscribe((message:Message)=>{
      this.messages.push(message)
    })
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


}
