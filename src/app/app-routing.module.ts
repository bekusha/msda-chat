import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { UserslistComponent } from './components/userslist/userslist.component';
import { ChatComponent } from './components/chat/chat.component';
import { AppLayoutComponent } from './components/app-layout/app-layout.component';
const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: '',
    component: AppLayoutComponent, // Use the layout component for these routes
    children: [
      { path: 'userslist', component: UserslistComponent },
      { path: 'chat', component: ChatComponent },
    ],
  },
];

// const routes: Routes = [
//   {path: '', component: LoginComponent},
//   {path: 'userslist', component: UserslistComponent},
//   {path: 'chat', component:ChatComponent}
// ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
