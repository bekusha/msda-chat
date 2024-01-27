import { Component } from '@angular/core';
import { PeerService } from '../peer.service';
import { ActivatedRoute } from '@angular/router'; 

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  messages = []
  newMessage = ''
  currentPeerId = ''

  constructor(private peerService: PeerService, private route: ActivatedRoute){}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const selectedUserPeerId = params['peerId'];
      console.log(selectedUserPeerId)
      if(selectedUserPeerId){
        this.currentPeerId = selectedUserPeerId
      }
    })
  }

  sendMessage(){
    if(this.newMessage.trim() === '')return;
    console.log(this.currentPeerId)
    this.peerService.sendData(this.currentPeerId, this.newMessage)
  }


}
