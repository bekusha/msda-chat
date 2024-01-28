import { Injectable } from '@angular/core';
import { User } from './interfaces/user.interface';
import { SignallingService } from './signalling.service';
import { Observable } from 'rxjs';

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
      this.signalingService.setCurrentUserUuid(this.currentUser.peerId)
} 
  }

  // getUserDataById(userId: string): Observable<User> {
  //   // Make an HTTP request to your server to fetch the user data by ID
  //   return this.http.get<User>(`/api/users/${userId}`);
  // }
}
