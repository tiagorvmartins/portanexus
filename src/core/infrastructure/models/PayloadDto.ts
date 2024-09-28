import { instanceToPlain } from "class-transformer";

export default abstract class PayloadDto<ApplicationType> {
  abstract transform(payload: ApplicationType): unknown;

  constructor(payload: ApplicationType) {
    const props = this.transform(payload);

    Object.assign(this, props);
  }

  toPlain() {
    return instanceToPlain(this, { excludeExtraneousValues: true });
  }
}
