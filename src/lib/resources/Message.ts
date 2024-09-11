import { stateset } from '../../stateset-client';

class Messages {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'messages');
  }

  async get(messageId: string) {
    return this.stateset.request('GET', `messages/${messageId}`);
  }

  async create(messageData: any) {
    return this.stateset.request('POST', 'messages', messageData);
  }

  async update(messageId: string, messageData: any) {
    return this.stateset.request('PUT', `messages/${messageId}`, messageData);
  }

  async delete(messageId: string) {
            return this.stateset.request('DELETE', `messages/${messageId}`);
  }

}

export default Messages;