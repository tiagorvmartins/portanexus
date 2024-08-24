import { module } from "inversify-sugar";

import { CoreModule } from "./core/CoreModule";
import { StackModule } from "./stacks/StackModule";
import { ContainerModule } from "./containers/ContainerModule";
import { ThemeModule } from "./theme/store/ThemeModule";
import { LoadingModule } from "./loading/store/LoadingModule";
import { EndpointModule } from "./endpoints/EndpointModule";

@module({
  imports: [CoreModule, ThemeModule, EndpointModule, LoadingModule, ContainerModule, StackModule],
})
export default class AppModule {}
