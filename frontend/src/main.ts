import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";
import { installBootstrapErrorListeners, showBootstrapError } from "./app/core/bootstrap/bootstrap-ui";

installBootstrapErrorListeners();

bootstrapApplication(AppComponent, appConfig).catch((error) => showBootstrapError(error));
