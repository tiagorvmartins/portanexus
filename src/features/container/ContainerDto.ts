import { Expose } from "class-transformer";
import ContainerEntity from "../../types/ContainerEntity";
import ResponseDto from "src/types/ResponseDto";

export default class ContainerDto extends ResponseDto<ContainerEntity> {
  @Expose()
  Id?: number;

  @Expose()
  Created?: string;

  @Expose()
  State?: any;

  @Expose()
  Names?: string[];

  @Expose()
  Status?: string;

  @Expose()
  Portainer?: any;

  toDomain() {
    return {
      Id: this.Id,
      Names: this.Names,
      Created: this.Created,
      State: this.State,
      Portainer: this.Portainer,
      Status: this.Status,
      Collapsed: true
    };
  }
}