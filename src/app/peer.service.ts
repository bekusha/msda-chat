import { Injectable } from '@angular/core';
import Peer, { DataConnection, MediaConnection } from 'peerjs'; 
import { v4 as uuidv4 } from 'uuid'; 
import { Message } from './interfaces/messsage.interface';
import { Observable, Subject } from 'rxjs';
import { CallData } from './interfaces/callData.interface';



@Injectable({
  providedIn: 'root'
})
export class PeerService {
  

  private peer:Peer;
  private myId: string = uuidv4();
  private peers: string[] = [];
  private connections : {[key: string]: DataConnection} = {}
  private messages: Message[] = []
  private callSubject = new Subject<CallData>();
  private isIncomingCall = false;
  private mediaConnections: {[key: string]: MediaConnection} = {};


  constructor(
    
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
this.peer.on('call', (call) => {
  this.handleCall(call)
  const incomingCallData = {
    call: call,
    callerId: call.peer,
    status: 'incoming'  // Indicates an incoming call
  };
  this.callSubject.next(incomingCallData)
  this.handleCall(call)
});

  }

  private handleCall(call: MediaConnection) {
    const callerId = call.peer;
    
    call.on('stream', (remoteStream) => {
      console.log('Received a call from peer:', callerId); // Log the callerId when receiving the call
      const callData = { stream: remoteStream, call: call, callerId: callerId, status: 'connected' };
      console.log('Emitting call data through callSubject', callData); // Log the call data
      this.callSubject.next(callData);
      console.log(this.callSubject)
    });
  
    call.on('close', () => {
      console.log('Closed call with peer:', callerId); // Log the callerId when closing the call
      this.callSubject.next({ call: call, status: 'closed' });
    });
  
    call.on('error', (err: any) => {
      console.error(`Call with peer ${callerId} encountered an error: ${err}`);
    });
  }
  

  isIncomingCallActive(): boolean{
    return this.isIncomingCall;
  }

  setIncomingCallStatus(status: boolean){
    this.isIncomingCall = status
  }

  getCallStream(): Observable<CallData>{
    console.log(this.callSubject)
    return this.callSubject.asObservable()
  }

  async initiateCall(otherPeerId: string): Promise<MediaConnection>{
    try {
      const stream = await this.getUserMedia();
      console.log(stream);
      const call = this.peer.call(otherPeerId, stream);
      this.handleCall(call);
      console.log(call);
      return call;
    } catch (err) {
      console.error('Failed to get local stream', err);
      throw err;
    }
    
  }

  private setupCallEvent() {
    this.peer.on('call', (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          call.answer(stream); // Answer the call with your own video/audio stream
          this.handleCall(call);
        })
        .catch((err) => {
          console.error('Failed to get local stream', err);
        });
    });
  }





  answerCall(call: MediaConnection): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.getUserMedia().then(stream => {
        call.answer(stream); // Answer the call with the local stream
  
        // Event: when the remote stream is received
        call.on('stream', remoteStream => {
          const callerId = call.peer;
          console.log(`Received remote stream from peer: ${callerId}`);
          this.callSubject.next({ 
            stream: remoteStream, 
            call: call, 
            callerId: callerId, 
            status: 'active' 
          });
          
        });
  
        // Event: when the call is closed
        call.on('close', () => {
          console.log(`Call with peer ${call.peer} has ended.`);
          this.callSubject.next({ call: call, status: 'closed' });
          resolve(); // Resolve the promise when the call is closed
        });
  
        // Event: when an error occurs during the call
        call.on('error', err => {
          console.error(`Error during call with peer ${call.peer}: `, err);
          this.callSubject.next({ 
            call: call, 
            status: 'error' 
          });
          reject(err); // Reject the promise on error
        });
  
      }).catch(err => {
        // Handle errors when trying to get the user's media
        console.error('Failed to get local stream for answering the call', err);
        this.callSubject.next({ 
          call: call, 
          status: 'failed' 
        });
        reject(err); // Reject the promise if getUserMedia fails
      });
    });
  }
  

  endCall(call: MediaConnection) {
    call.close();
   
  }

  sendData(otherPeerId: string, message: Message) {
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
  

  private handleReceivedData(data:unknown): void {
    const message = data as Message;
    if (message && typeof message === 'object') {
      console.log('Received data:', message);
      this.messages.push(message);
      
    } else {
      console.error('Received data is not a valid Message:', data);
    }
  }
  getMessages(): Message[] {
    return this.messages;
  }
  clearMessages(): void {
    this.messages = [];
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
      throw error; 
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
