import BaseIntegration from './BaseIntegration';

export default class XeroIntegration extends BaseIntegration {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.xero.com');
  }

  public async getChannels() {
    return this.request('GET', 'channels');
  }

  public async getMessages(channelId: string) {
    return this.request('GET', `channels/${channelId}/messages`);
  }

  public async getUsers() {
    return this.request('GET', 'users');
  }

  public async getUser(userId: string) {
    return this.request('GET', `users/${userId}`);
  }

  public async getUserMessages(userId: string) {
    return this.request('GET', `users/${userId}/messages`);
  }
}
