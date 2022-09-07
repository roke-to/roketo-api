import { AppService } from './app.service';
import { HelloResponse } from './hello-response.dto';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(req: any): HelloResponse;
}
