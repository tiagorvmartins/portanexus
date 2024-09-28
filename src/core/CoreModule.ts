import { getModuleContainer, module } from "inversify-sugar";
import I18n from "src/core/presentation/i18n";
import { InsecureEnvToken } from "src/core/domain/entities/InsecureEnv";
import env from "src/core/infrastructure/env";
import { IHttpClientToken } from "./domain/specifications/IHttpAxiosConnector";
import HttpClient from "./infrastructure/implementations/HttpClient";
import { SecureStoreModule } from "./SecureStoreModule";
import { Auth } from "./stores/auth/Auth";

@module({
  imports: [
    SecureStoreModule
  ],
  providers: [
    I18n,
    {
      isGlobal: true,
      provide: InsecureEnvToken,
      useValue: env,
    },
    {
      isGlobal: true,
      provide: IHttpClientToken,
      useClass: HttpClient,
    },
    {
      useClass: Auth,
      scope: "Transient",
    },
  ],
})
export class CoreModule {}

export const coreModuleContainer = getModuleContainer(CoreModule);
