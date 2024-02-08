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

  ngOnInit() {
    this.loadUserDetailsForAutofill();
  }

  private loadUserDetailsForAutofill() {
    const userDetailsForAutofill = localStorage.getItem('userDetailsForAutofill');
    if (userDetailsForAutofill) {
      const { name, lastName, username } = JSON.parse(userDetailsForAutofill);
      this.user.name = name;
      this.user.lastName = lastName;
      this.user.username = username;
    }
  }

  login() {
    this.assignPeerIdIfNeeded();
    this.authService.login(this.user); 
    localStorage.setItem('userDetailsForAutofill', JSON.stringify({
      name: this.user.name,
      lastName: this.user.lastName,
      username: this.user.username
    }));
    this.router.navigate(['userslist']);
  }

  private assignPeerIdIfNeeded() {
    if (!this.user.peerId) {
      this.user.peerId = uuidv4();
      localStorage.setItem('currentUser', JSON.stringify(this.user));
    }
  }
}
