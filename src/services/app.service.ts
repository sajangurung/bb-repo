import { Bitbucket } from "bitbucket";
import { APIClient } from "bitbucket/src/plugins/register-endpoints/types";

export class AppService {
  private client: any;
  constructor() {
    const clientOptions = {
      baseUrl: "https://api.bitbucket.org/2.0",
      headers: {},
      options: {
        timeout: 10
      }
    };
    this.client = new Bitbucket(clientOptions);
  }

  getRepositories() {
    return this.client.request();
  }
}
