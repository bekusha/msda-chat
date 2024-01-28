import { MediaConnection } from "peerjs";

export interface CallData {
    stream?: MediaStream | null;
    call: MediaConnection;
    callerId?: string;
    status:string;
    localStream?: MediaStream | null; 
  }