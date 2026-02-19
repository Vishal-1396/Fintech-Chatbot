
export enum Sender {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system'
}

export interface FileData {
  name: string;
  type: string;
  data: string; // base64 for images, raw text for docs
}

export interface Source {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: number;
  files?: FileData[];
  isThinking?: boolean;
  sources?: Source[];
}

export interface ChatSession {
  id: string;
  messages: Message[];
  uploadedFiles: FileData[];
  pendingFallbackRequest: boolean;
}
