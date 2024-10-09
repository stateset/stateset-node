import BaseIntegration from './BaseIntegration';

export default class TwilioIntegration extends BaseIntegration {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.twilio.com');
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
  
}