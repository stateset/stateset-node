import { stateset } from '../../stateset-client';
declare class Messages {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(messageId: string): Promise<any>;
    create(messageData: any): Promise<any>;
    update(messageId: string, messageData: any): Promise<any>;
    delete(messageId: string): Promise<any>;
}
export default Messages;
