import { Injectable } from '@angular/core';
import Peer, { DataConnection } from 'peerjs'; 

@Injectable({
  providedIn: 'root'
})
export class PeerService {

  private peer:Peer;
  private myId: string = '';
  private connections : {[key: string]: DataConnection} = {}

  constructor() { 
    this.peer = new Peer();
    this.peer.on('open', (id) =>{
      this.myId = id;
      console.log(`My peer ID is: ${id}`);

    })
  }

  async getUserMedia(video: boolean = true, audio: boolean = true): Promise<MediaStream> {
    try {
      return await navigator.mediaDevices.getUserMedia({ video, audio });
    } catch (error) {
      console.error('Error getting user media:', error);
      throw error; // Rethrow the error so the caller knows the media request failed
    }
  }

  getMyId():string{
    console.log(this.myId)
    return this.myId
  }
}
