import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UserslistComponent } from './userslist/userslist.component';
import { ChatComponent } from './chat/chat.component';

const routes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'userslist', component: UserslistComponent},
  {path: 'chat', component:ChatComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
