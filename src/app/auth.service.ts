import { Injectable } from '@angular/core';
import { User } from './interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUser: User | null = null;
  private allUsers: User[] = []

  constructor() {
    
   }
  

  login(user: User){
    if(user){
      this.currentUser = user;
      this.allUsers.push(this.currentUser)
    }
  }
}
