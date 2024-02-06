import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/interfaces/user.interface';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  user: User = {
    name: '',
    lastName: '',
    username: '',
    peerId: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    this.assignPeerIdIfNeeded();
    this.authService.login(this.user); 
    this.router.navigate(['userslist']);
  }

  private assignPeerIdIfNeeded() {
    if (!this.user.peerId) {
      this.user.peerId = uuidv4();
      localStorage.setItem('currentUser', JSON.stringify(this.user));
    }
  }
}
