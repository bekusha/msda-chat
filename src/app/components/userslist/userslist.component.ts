import { Component, ElementRef, ViewChild } from '@angular/core';
import { User } from 'src/app/interfaces/user.interface';
import { MatDialog } from '@angular/material/dialog';
import { SignallingService } from 'src/app/services/signalling.service';
import { PeerService } from 'src/app/services/peer.service';
import { Router } from '@angular/router';
import { CallData } from 'src/app/interfaces/callData.interface';
import { CallNotificationComponent } from '../call-notification/call-notification.component';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-userslist',
  templateUrl: './userslist.component.html',
  styleUrls: ['./userslist.component.css']
})
export class UserslistComponent {
  @ViewChild('localVideo') localVideo!: ElementRef;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef;

  public allUsers: User[] | null = [];
  public friendsList: User[] | null = [];
  localStream!: MediaStream;
  showAllUsers = false;
  private friendsListSubscription: Subscription | null = null;
  isCallIncoming = false;
  isNewMessageReceived = false;

  constructor(
    private authService: AuthService,
    private signalingService: SignallingService,
    private peerService: PeerService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadFriendsListFromLocalStorage()
    this.updateUsersList();
    this.updateFriendsList();
    this.subscribeToMessages();
  }
  updateUsersList(): void {
    this.signalingService.listen('users-list').subscribe((usersData: User[]) => {
      this.allUsers = usersData;
      console.log('Updated users list:', this.allUsers);
    });
  }

  private subscribeToMessages(): void {
    this.peerService.messageReceived$.subscribe(message => {
      console.log(message)
      // Assuming the message contains enough information to identify the user (e.g., userId)
      this.updateMessageIconForUser(message.sender);
    });
  }

  private updateMessageIconForUser(peerId: string): void {
    const user = this.friendsList?.find(u => u.peerId === peerId);
    console.log(user)
    if (user) {
      user.hasNewMessage = true;
      console.log(user)
    }
  }

  loadFriendsListFromLocalStorage(): void {
    const storedFriendsList = localStorage.getItem('friendsList');
    if (storedFriendsList) {
      this.friendsList = JSON.parse(storedFriendsList);
    }
  }

  updateFriendsList(): void {
    this.friendsListSubscription = this.signalingService.listenForFriendsListUpdate().subscribe((newFriend: User) => {
      if (!this.friendsList) {
        this.friendsList = [];
      }
      this.friendsList.push(newFriend);
      localStorage.setItem('friendsList', JSON.stringify(this.friendsList)); // Save updated list to localStorage
    });
  }


  toggleAllUsers() {
    this.showAllUsers = !this.showAllUsers;
  }

  sendFriendRequest(selectedPeerId: string): void {
    console.log(selectedPeerId);
    this.signalingService.emitFriendRequest(selectedPeerId);
    this.peerService.connectToPeer(selectedPeerId);
  }

  selectUserForChat(user: User) {
    const selectedUserPeerId = user.peerId;
    this.router.navigate(['chat'], { queryParams: { peerId: selectedUserPeerId } });
  }

  openCallDialog(callData: CallData) {
    console.log(callData)
    const dialogRef = this.dialog.open(CallNotificationComponent, {
      width: '350px',
      data: callData
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The call dialog was closed');
    });
  }

  async getLocalStream(): Promise<MediaStream> {
    try {
      const stream = await this.peerService.getUserMedia();
      this.localStream = stream;

      if (this.localVideo) {
        this.localVideo.nativeElement.srcObject = stream;
        this.localVideo.nativeElement.muted = true;
      }
      return stream;
    } catch (error) {
      console.error('Error getting user media:', error);
      throw error;
    }
  }
}
