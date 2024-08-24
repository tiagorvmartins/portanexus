import { module } from "inversify-sugar";
import { ISecureStoreWrapperToken } from "./domain/specifications/ISecureStoreWrapper";
import SecureStoreWrapper from "./infrastructure/implementations/SecureStoreWrapper";

@module({
    providers: [
        {
            isGlobal: true,
            provide: ISecureStoreWrapperToken,
            useClass: SecureStoreWrapper,
        },
    ]
})
export class SecureStoreModule {}