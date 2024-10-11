import BaseIntegration from './BaseIntegration';
export default class TwilioIntegration extends BaseIntegration {
    constructor(apiKey: string);
    getMessages(channelId: string): Promise<any>;
    getUsers(): Promise<any>;
    getUser(userId: string): Promise<any>;
}
