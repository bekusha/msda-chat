import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { SignallingService } from './signalling.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private allUsers: User[] = [];
  private readonly allUserKey = 'allUsers';

  constructor(private signalingService: SignallingService) {
    this.loadInitialData();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getAllUsers() {
    return this.allUsers;
  }

  login(user: User) {
    const existingUserIndex = this.allUsers.findIndex(u => u.username === user.username);
    if (existingUserIndex === -1) {
      user.peerId = user.peerId || uuidv4();
      this.allUsers.push(user);
    } else {
      user = this.allUsers[existingUserIndex];
      console.log(`User ${user.username} is already registered. Logging in with existing data.`);
    }
    this.updateUserState(user);
  }

  private updateUserState(user: User) {
    this.currentUserSubject.next(user);
    this.signalingService.registerUser(user);
    localStorage.setItem(this.allUserKey, JSON.stringify(this.allUsers));
  }

  private loadInitialData() {
    const storedAllUsers = localStorage.getItem(this.allUserKey);
    if (storedAllUsers) {
      this.allUsers = JSON.parse(storedAllUsers);
    } else {
      this.allUsers = [];
    }
  }

  doesUsernameExist(username: string): boolean {
    return this.allUsers.some(user => user.username === username);
  }
}
