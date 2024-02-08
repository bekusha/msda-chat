import { Injectable } from '@angular/core';
import Peer, { DataConnection, MediaConnection } from 'peerjs';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../interfaces/messsage.interface';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { CallData } from '../interfaces/callData.interface';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PeerService {
  private peer!: Peer;
  private myId: string = uuidv4();
  private peers: string[] = [];
  private connections: { [key: string]: DataConnection } = {};
  private messages: Message[] = [];
  private callSubject = new Subject<CallData>();
  private isIncomingCall = false;
  private mediaConnections: { [key: string]: MediaConnection } = {};
  private remoteStream: MediaStream | null = null;
  private remoteStreamSubject = new BehaviorSubject<MediaStream | null>(null);
  private currentUserSubscription!: Subscription;
  private messageReceivedSource = new Subject<any>();
  messageReceived$ = this.messageReceivedSource.asObservable();

  constructor(private authService: AuthService) {
    this.currentUserSubscription = this.subscribeToUser();
  }

  private subscribeToUser() {
    return this.authService.currentUser$.subscribe(user => {
      console.log(user);
      if (user && user.peerId !== this.myId) {
        this.myId = user.peerId;
        this.initializePeer();
        this.peers.forEach(peerId => {
          if (!this.connections[peerId]) {
            this.connectToPeer(peerId);
          }
        });
      }
    });
  }

  public initializePeer() {
    if (!this.peer) {
      const iceServers = [
        { urls: environment.STUN_URI },
        {
          urls: environment.TURN_URL,
          username: environment.TURN_USERNAME,
          credential: environment.TURN_CREDENTIAL
        }
      ];
      this.peer = new Peer(this.myId, {
        config: { iceServers: iceServers }
      });

      this.peer.on('open', id => {
        console.log(`PeerJS confirmed ID: ${id}`);
      });

      this.peer.on('connection', conn => {
        conn.on('open', () => {
          this.connections[conn.peer] = conn;
          conn.on('data', data => this.handleReceivedData(data));
        });
      });

      this.peer.on('call', call => {
        const user = this.authService.getCurrentUser();
        this.handleCall(call);
        const incomingCallData: CallData = {
          call: call,
          callerId: call.peer,
          status: 'incoming',
          user: user || undefined
        };
        this.callSubject.next(incomingCallData);
      });
    }
  }

  private handleCall(call: MediaConnection) {
    const callerId = call.peer;
    call.on('stream', remoteStream => {
      console.log(`Received a call from peer: ${callerId}`);
      const callData: CallData = {
        stream: remoteStream,
        call: call,
        callerId: callerId,
        status: 'connected'
      };
      console.log(`Emitting call data through callSubject`, callData);
      this.callSubject.next(callData);
    });

    call.on('close', () => {
      console.log(`Closed call with peer: ${callerId}`);
      this.callSubject.next({ call: call, status: 'closed' });
    });

    call.on('error', err => {
      console.error(`Call with peer ${callerId} encountered an error: ${err}`);
    });
  }

  isIncomingCallActive(): boolean {
    return this.isIncomingCall;
  }

  setIncomingCallStatus(status: boolean) {
    this.isIncomingCall = status;
  }

  getCallStream(): Observable<CallData> {
    return this.callSubject.asObservable();
  }

  async initiateCall(otherPeerId: string): Promise<MediaConnection> {
    try {
      const stream = await this.getUserMedia();
      const call = this.peer.call(otherPeerId, stream);
      this.handleCall(call);
      return call;
    } catch (err) {
      console.error('Failed to get local stream', err);
      throw err;
    }
  }

  answerCall(call: MediaConnection): Promise<MediaStream> {
    return new Promise((resolve, reject) => {
      this.getUserMedia().then(stream => {
        call.answer(stream);
        call.on('stream', remoteStream => {
          const callerId = call.peer;
          const user = this.authService.getCurrentUser();
          console.log(`Received remote stream from peer: ${callerId}`);
          this.callSubject.next({
            stream: remoteStream,
            call: call,
            callerId: callerId,
            status: 'active',
            user: user!
          });
          resolve(remoteStream);
        });

        call.on('close', () => {
          console.log(`Call with peer ${call.peer} has ended.`);
          this.callSubject.next({ call: call, status: 'closed' });
        });

        call.on('error', err => {
          console.error(`Error during call with peer ${call.peer}:`, err);
          this.callSubject.next({ call: call, status: 'error' });
          reject(err);
        });
      }).catch(err => {
        console.error('Failed to get local stream for answering the call', err);
        this.callSubject.next({ call: call, status: 'failed' });
        reject(err);
      });
    });
  }

  endCall(call: MediaConnection) {
    call.close();
  }

  async sendData(otherPeerId: string, message: Message) {
    console.log(`Sending data to peer: ${otherPeerId}`);
    console.log(`Available connections:`, this.connections);

    const conn = this.connections[otherPeerId];
    if (!conn) {
      const newConnection = this.connectToPeer(otherPeerId);
      newConnection.on('open', () => {
        newConnection.send(message);
        console.log(`Sent message to peer: ${otherPeerId}`);
      });
    } else {
      conn.send(message);
      console.log(`Sent message to peer: ${otherPeerId}`);
    }
  }

  private handleReceivedData(data: unknown): void {
    const message = data as Message;
    if (message && typeof message === 'object') {
      console.log('Received data:', message);
      this.messageReceivedSource.next(message);
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
    console.log(`Connecting to peer: ${otherPeerId}`);
    const conn = this.peer.connect(otherPeerId);
    conn.on('open', () => {
      this.connections[otherPeerId] = conn;
      conn.on('data', data => this.handleReceivedData(data));
      console.log(`Connected to peer: ${otherPeerId}`);
    });
    conn.on('error', err => {
      console.error(`Error connecting to peer ${otherPeerId}:`, err);
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

  getConnectedPeers(): string[] {
    return this.peers;
  }

  setRemoteStream(stream: MediaStream | null) {
    this.remoteStream = stream;
    this.remoteStreamSubject.next(stream);
    console.log('Setting remote stream', stream);
  }

  getRemoteStreamObservable(): Observable<MediaStream | null> {
    return this.remoteStreamSubject.asObservable();
  }

  logout() {
    if (this.peer) {
      this.peer.disconnect();
      this.peer.destroy();
    } else {
      console.warn('Peer instance not found. Cannot disconnect or destroy.');
    }
    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
    }
  }
}
