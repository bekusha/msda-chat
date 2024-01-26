import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { User } from '../interfaces/user.interface';

import { SignallingService } from '../signalling.service';

@Component({
  selector: 'app-userslist',
  templateUrl: './userslist.component.html',
  styleUrls: ['./userslist.component.css']
})
export class UserslistComponent {
  public allUsers: User[] | [] = []
constructor(private authService: AuthService, private signalingService: SignallingService){
  
}
ngOnInit(): void {
  this.signalingService.listen('users-list').subscribe((users: User[])=>{
    this.allUsers = users;
    console.log('Updated users list:', this.allUsers)
  })
  
}

logout(){

}

}
