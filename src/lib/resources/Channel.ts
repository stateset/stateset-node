import { stateset } from '../../stateset-client';

class Channels {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'channels');
  }

  async get(channelId: string) {
    return this.stateset.request('GET', `channels/${channelId}`);
  }

  async create(channelData: any) {
    return this.stateset.request('POST', 'channels', channelData);
  }

  async update(channelId: string, channelData: any) {
    return this.stateset.request('PUT', `channels/${channelId}`, channelData);
  }

  async delete(channelId: string) {
        return this.stateset.request('DELETE', `channels/${channelId}`);
  }

}

export default Channels;    