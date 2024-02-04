import { MediaConnection } from "peerjs";
import { User } from "./user.interface";

export interface CallData {
    stream?: MediaStream | null;
    call: MediaConnection;
    callerId?: string;
    status:string;
    localStream?: MediaStream | null; 
    user? : User
  }