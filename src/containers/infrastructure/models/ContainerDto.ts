import ResponseDto from "src/core/infrastructure/models/ResponseDto";
import { Expose } from "class-transformer";
import ContainerEntity from "../../domain/entities/ContainerEntity";


export default class ContainerDto extends ResponseDto<ContainerEntity> {
  @Expose()
  Id!: number;

  @Expose()
  Created!: string;

  @Expose()
  State!: any;

  @Expose()
  Names!: string;

  @Expose()
  Status!: string;

  @Expose()
  Portainer!: any;

  toDomain() {
    return {
      Id: this.Id,
      Names: this.Names,
      Created: this.Created,
      State: this.State,
      Portainer: this.Portainer,
      Status: this.Status
    };
  }
}