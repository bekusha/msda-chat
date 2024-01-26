import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { User } from './interfaces/user.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignallingService {

  private socket:any;
  readonly uri: string = 'http://localhost:3000';

  

  constructor() {
    this.socket = io(this.uri)
   }

   registerUser(userData:User){
    this.socket.emit('register', userData);
    console.log('register user from signalingService: ' + userData)
   }

   emit(event: string, data: any) {
    this.socket.emit(event, data);
    console.log(`Emitting event: ${event}`);
  }

  listen(eventName: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
        console.log(data)
      });
    });

   
  }

  emitFriendRequest(targetPeerId: string):void{
    console.log('request sending')
    this.socket.emit('send-friend-request', {target: targetPeerId})
  }

  emitFriendRequestAccepted(senderPeerId: string): void{
    this.socket.emit('friend-request-accepted', {senderPeerId})
  }

  emitFriendRequestRejected(senderPeerId:string){
    this.socket.emit('friend-request-rejected', {senderPeerId})
  }

  listenForFriendRequest():Observable<any>{
    return this.listen('friend-request-received')
  }



  

}
