declare module '../utils/response' {
  export class ApiResponse {
    static success(res: any, message: string, data?: any): any;
    static error(res: any, message: string, status?: number): any;
  }
}
