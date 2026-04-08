import { ErrorHandler, Injectable, inject } from "@angular/core";
import { AppRuntimeService } from "../services/app-runtime.service";

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  private readonly runtime = inject(AppRuntimeService);

  handleError(error: unknown): void {
    this.runtime.reportError(error, "Angular runtime");
  }
}
