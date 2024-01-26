import { Injectable } from '@angular/core';
import Peer, { DataConnection } from 'peerjs'; 
import { v4 as uuidv4 } from 'uuid'; 
import { SignallingService } from './signalling.service';

@Injectable({
  providedIn: 'root'
})
export class PeerService {

  private peer:Peer;
  private myId: string = uuidv4();
  private peers: string[] = [];
  // private connections : {[key: string]: DataConnection} = {}

  constructor(
    private signalingService : SignallingService
  ) { 
    this.peer = new Peer({
      host: 'localhost',
      port: 9000,
      path: '/myapp',
      secure: false, 
      key: 'peerjs' 
    });
    this.peer.on('open', (id) =>{
      this.myId = id;
      
      console.log(`My peer ID is: ${id}`);
 })
    this.peer.on('connection', (conn) => {
      conn.on('open', () => {
        conn.on('data', this.handleReceivedData);
        console.log(`connected to peer: ${conn.peer} `)
      })
      
      
    });
  }

  private handleReceivedData(data:any): void {
    console.log('Received data:', data);
  }


  connectToPeer(otherPeerId: string): DataConnection{
// selected users id need here 
    const conn = this.peer.connect(otherPeerId)
    conn.on('open', () => {
      conn.on('data', this.handleReceivedData);
     
      console.log(`Connected to peer: ${conn.peer}`);
    })
    return conn;
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

  getConnectedPeers(): string[]{
    return this.peers 
  }
}
