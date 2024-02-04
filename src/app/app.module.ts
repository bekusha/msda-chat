import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { LoginComponent } from './components/login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { FormsModule } from '@angular/forms';
import { UserslistComponent } from './components/userslist/userslist.component';
import { FriendrequestdialogComponent } from './components/friendrequestdialog/friendrequestdialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ChatComponent } from './components/chat/chat.component';
import { CallNotificationComponent } from './components/call-notification/call-notification.component';
import { AppLayoutComponent } from './components/app-layout/app-layout.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UserslistComponent,
    FriendrequestdialogComponent,
    ChatComponent,
    CallNotificationComponent,
    AppLayoutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    MatDialogModule
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
