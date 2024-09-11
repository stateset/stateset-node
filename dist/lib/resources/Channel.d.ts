import { stateset } from '../../stateset-client';
declare class Channels {
    private stateset;
    constructor(stateset: stateset);
    list(): Promise<any>;
    get(channelId: string): Promise<any>;
    create(channelData: any): Promise<any>;
    update(channelId: string, channelData: any): Promise<any>;
    delete(channelId: string): Promise<any>;
}
export default Channels;
