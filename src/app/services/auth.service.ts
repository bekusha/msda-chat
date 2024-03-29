import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { SignallingService } from './signalling.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userLoggedIn = new EventEmitter<User>();
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  

  constructor(private signallingService: SignallingService) {
    this.loadCurrentUser();
  }

  private registerAndSetCurrentUser(user: User) {
    this.signallingService.registerUser(user); 
    this.currentUserSubject.next(user);
  }

  private loadCurrentUser() {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      const retrievedUser: User = JSON.parse(storedUser);
      this.registerAndSetCurrentUser(retrievedUser);
    }
  }

  getCurrentUser(): User | null {
    console.log(this.currentUserSubject.value);
    return this.currentUserSubject.value;
  }

  // login(user: User) {
  //   // localStorage.setItem('currentUser', JSON.stringify(user));
  //   // this.registerAndSetCurrentUser(user);
  // }

  // doesUsernameExist(username: string): boolean {
  //   return this.allUsers.some(user => user.username === username);
  // }

  logout() {
    sessionStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
