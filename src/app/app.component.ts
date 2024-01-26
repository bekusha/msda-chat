import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SignallingService } from './signalling.service';
import { User } from './interfaces/user.interface';
import { FriendrequestdialogComponent } from './friendrequestdialog/friendrequestdialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'messenger';

  constructor(
    private signalingService: SignallingService,
    private dialog: MatDialog
  ){}

  ngOnInit(): void {
    this.signalingService.listenForFriendRequest().subscribe((request: any) => {
      this.openFriendRequestDialog(request.from.peerId);
      console.log(request)
    })
    
  }

  openFriendRequestDialog(peerId:string){
    console.log(peerId)
    const dialogRef = this.dialog.open(FriendrequestdialogComponent, {
      data: {peerId: peerId}
    })

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        console.log(`Friend request accepted by ${result}`);
      } else if (result === false) {
        console.log(`Friend request rejected by ${result}`);
      }
    });
    
  }
}
