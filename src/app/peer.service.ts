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
  private connections : {[key: string]: DataConnection} = {}

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
    this.connections[conn.peer] = conn;  // Now 'this' refers to the PeerService instance
    conn.on('data', (data) => this.handleReceivedData(data));
    console.log(`connected to peer: ${conn.peer}`);
  });
});
  }

  sendData(otherPeerId: string, message: string) {
    console.log(`Sending data to peer: ${otherPeerId}`);
    console.log(`Available connections:`, this.connections);
  
    const conn = this.connections[otherPeerId];
    if (conn) {
      conn.send(message);
      console.log(`Sent message to peer: ${otherPeerId}`);
    } else {
      console.error(`No connection found for peer: ${otherPeerId}`);
    }
  }
  

  private handleReceivedData(data:any): void {
    console.log('Received data:', data);
  }


  connectToPeer(otherPeerId: string): DataConnection {
    const conn = this.peer.connect(otherPeerId);
    conn.on('open', () => {
      this.connections[otherPeerId] = conn;  // Store the connection
      conn.on('data', (data) => this.handleReceivedData(data));
      console.log(`Connected to peer: ${otherPeerId}`);
    });
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
