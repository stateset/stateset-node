import BaseIntegration from './BaseIntegration';
export default class XeroIntegration extends BaseIntegration {
    constructor(apiKey: string);
    getChannels(): Promise<any>;
    getMessages(channelId: string): Promise<any>;
    getUsers(): Promise<any>;
    getUser(userId: string): Promise<any>;
    getUserMessages(userId: string): Promise<any>;
}
