import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UserslistComponent } from './userslist/userslist.component';

const routes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'userslist', component: UserslistComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
