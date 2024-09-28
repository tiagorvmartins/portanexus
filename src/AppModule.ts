import { module } from "inversify-sugar";

import { CoreModule } from "./core/CoreModule";
import { StackModule } from "./stacks/StackModule";
import { ContainerModule } from "./containers/ContainerModule";
import { SettingsModule } from "./settings/store/SettingsModule";
import { LoadingModule } from "./loading/store/LoadingModule";
import { EndpointModule } from "./endpoints/EndpointModule";

@module({
  imports: [CoreModule, SettingsModule, EndpointModule, LoadingModule, ContainerModule, StackModule],
})
export default class AppModule {}
