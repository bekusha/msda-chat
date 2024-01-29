import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { User } from '../interfaces/user.interface';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignallingService {

  private socket:any;
  readonly uri: string = 'http://localhost:3000';
  private friendsList: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([])
  // private currentUserUuid: string | null = null;
  

  constructor() {
    this.socket = io(this.uri)
   }

   registerUser(userData:User){
    this.socket.emit('register', userData);
    console.log('register user from signalingService: ' + userData)
   }

  //  setCurrentUserUuid(uuid: string) {
  //   this.currentUserUuid = uuid;
  // }
  // getCurrentUserUuid(): string | null {
  //   return this.currentUserUuid;
  // }

   addFriend(user:User){
    const currentFriends = this.friendsList.value;
    if(!currentFriends.find(friend => friend.peerId === user.peerId)){
      this.friendsList.next([...currentFriends, user]);
    }
   }
   getFriendsListObservable() {
    return this.friendsList.asObservable();
  }

  listenForFriendsListUpdate(): Observable<User> {
    return new Observable<User>(subscriber => {
      this.socket.on('update-friends-list', (user: User) => {
        subscriber.next(user);
      });
    });
  }

  //  getFriendsList(): User[] {
  //   return this.friendsList.asObservable();
  // }

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
    console.log('request sending' + targetPeerId)
    this.socket.emit('send-friend-request', {target: targetPeerId})
  }

  emitFriendRequestAccepted(senderPeerId: string, targetPeerId: string): void{
    console.log(senderPeerId)
    this.socket.emit('accept-friend-request', { 
      target: targetPeerId, 
      senderUuid: senderPeerId 
    })
  }

  emitFriendRequestRejected(senderPeerId:string){
    this.socket.emit('friend-request-rejected', {senderPeerId})
  }

  listenForFriendRequest():Observable<any>{
    return this.listen('friend-request-received')
  }



  

}
