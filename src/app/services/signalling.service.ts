import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { User } from '../interfaces/user.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SignallingService {
  private socket: any;
  readonly uri: string = 'http://localhost:3000';
  private friendsList: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);

  constructor() {
    this.socket = io(this.uri);
  }

  initiateCall(targetPeerId: string, additionalData?: User): void {
    console.log(`Initiating call to ${targetPeerId} with data:`, additionalData);
    this.socket.emit('initiateCall', { targetPeerId, ...additionalData });
  }

  listenForIncomingCall(): Observable<any> {
    return new Observable(subscriber => {
      this.socket.on('callInitiated', (data: any) => {
        subscriber.next(data);
        console.log('Incoming call with data:', data);
      });
    });
  }

  registerUser(userData: User) {
    this.socket.emit('register', userData);
    console.log('Register user from SignallingService: ' + JSON.stringify(userData));
  }

  addFriend(user: User) {
    const currentFriends = this.friendsList.value;
    if (!currentFriends.find(friend => friend.peerId === user.peerId)) {
      this.friendsList.next([...currentFriends, user]);
      console.log(currentFriends)
    }
  }

  getFriendsListObservable(): Observable<User[]> {
    return this.friendsList.asObservable();
  }

  listenForFriendsListUpdate(): Observable<User> {
    return new Observable<User>(subscriber => {
      this.socket.on('update-friends-list', (user: User) => {
        subscriber.next(user);
      });
    });
  }

  emit(event: string, data: any) {
    this.socket.emit(event, data);
    console.log(`Emitting event: ${event}`);
  }

  listen(eventName: string): Observable<any> {
    return new Observable(subscriber => {
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
        console.log(data);
      });
    });
  }

  emitFriendRequest(targetPeerId: string): void {
    console.log('Request sending to ' + targetPeerId);
    this.socket.emit('send-friend-request', { target: targetPeerId });
  }

  emitFriendRequestAccepted(senderPeerId: string, targetPeerId: string): void {
    console.log(`Accepting friend request from ${senderPeerId} to ${targetPeerId}`);
    this.socket.emit('accept-friend-request', {
      target: targetPeerId,
      senderUuid: senderPeerId
    });
  }

  emitFriendRequestRejected(senderPeerId: string) {
    console.log(`Rejecting friend request from ${senderPeerId}`);
    this.socket.emit('friend-request-rejected', { senderPeerId });
  }

  listenForFriendRequest(): Observable<any> {
    return this.listen('friend-request-received');
  }

  logOut() {
    this.socket.disconnect();
  }
}
