import { Injectable } from '@angular/core';
import { User } from './interfaces/user.interface';
import { SignallingService } from './signalling.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUser: User | null = null;
  private allUsers: User[] = []

  constructor(private signalingService: SignallingService) {
    
   }
  
   getAllUsers(){
    return this.allUsers
   }

  login(user: User){
    if(user){
      this.currentUser = user;
      this.allUsers.push(this.currentUser)
      this.signalingService.registerUser(this.currentUser)
    }
  }
}
