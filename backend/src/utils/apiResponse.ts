export class ApiResponse<T = any> {
  public success: boolean;
  public message: string;
  public data: T | null;

  constructor(success: boolean, message: string, data: T | null = null) {
    this.success = success;
    this.message = message;
    this.data = data;
  }

  static success<T>(data: T, message: string = 'Operation successful'): ApiResponse<T> {
    return new ApiResponse(true, message, data);
  }

  static error(message: string): ApiResponse<null> {
    return new ApiResponse(false, message, null);
  }
}
