import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { SignallingService } from './signalling.service';
import { v4 as uuidv4 } from 'uuid';
import { PeerService } from './peer.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userLoggedIn = new EventEmitter<User>();
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private allUsers: User[] = [];
  private readonly allUserKey = 'allUsers';
  private readonly currentUserIdentifierKey = 'currentUserIdentifier';

  constructor(private signallingService: SignallingService,
   ) {
    this.loadInitialData();
    console.log(this.currentUser$)
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getAllUsers() {
    return this.allUsers;
  }

  login(user: User) {
    const existingUserIndex = this.allUsers.findIndex(u => 
      u.name === user.name && u.lastName === user.lastName && u.username === user.username);
    if (existingUserIndex === -1) {
      user.peerId = user.peerId || uuidv4();
      this.allUsers.push(user);
    } else {
      user = this.allUsers[existingUserIndex];
      console.log(`User ${user.name} ${user.lastName} (${user.username}) is already registered. Logging in with existing data.`);
      
    }
    this.updateUserState(user);
    const identifier = this.generateIdentifier(user);
    sessionStorage.setItem(this.currentUserIdentifierKey, identifier); 
  }

  // login(user: User) {
  //   const existingUserIndex = this.allUsers.findIndex(u => u.username === user.username);
  //   if (existingUserIndex === -1) {
  //     user.peerId = user.peerId || uuidv4();
  //     this.allUsers.push(user);
  //   } else {
  //     user = this.allUsers[existingUserIndex];
  //     console.log(`User ${user.username} is already registered. Logging in with existing data.`);
  //   }
  //   this.updateUserState(user);
  // }

  private generateIdentifier(user: User): string {
    return `${user.name}-${user.lastName}-${user.username}`;
  }

  private updateUserState(user: User) {
    this.currentUserSubject.next(user);
    this.userLoggedIn.emit(user); // Emit event when user state is updated
    sessionStorage.setItem(this.allUserKey, JSON.stringify(this.allUsers));
  }
  
  private loadInitialData() {
    const storedAllUsers = sessionStorage.getItem(this.allUserKey);
    const storedCurrentUserIdentifier = sessionStorage.getItem(this.currentUserIdentifierKey);
    if (storedAllUsers) {
      this.allUsers = JSON.parse(storedAllUsers);
    }
    if (storedCurrentUserIdentifier) {
      const currentUser = this.allUsers.find(user => 
        this.generateIdentifier(user) === storedCurrentUserIdentifier);
      if (currentUser) {
        this.currentUserSubject.next(currentUser);
        console.log(currentUser)
        this.signallingService.registerUser(currentUser)
        // this.peerService.initializePeer()
      }
    }
  }

  // private loadInitialData() {
  //   const storedAllUsers = sessionStorage.getItem(this.allUserKey);
  //   if (storedAllUsers) {
  //     this.allUsers = JSON.parse(storedAllUsers);
  //     console.log(this.allUsers)
  //   } else {
  //     this.allUsers = [];
  //   }
  // }

  doesUsernameExist(username: string): boolean {
    return this.allUsers.some(user => user.username === username);
  }
}
