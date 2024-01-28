import { MediaConnection } from "peerjs";

export interface CallData {
    stream?: MediaStream;
    call: MediaConnection;
    callerId?: string;
    status:string
  }