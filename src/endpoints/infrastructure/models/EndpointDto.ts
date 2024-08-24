import ResponseDto from "src/core/infrastructure/models/ResponseDto";
import { Expose } from "class-transformer";
import EndpointEntity from "../../domain/entities/EndpointEntity";


export default class EndpointDto extends ResponseDto<EndpointEntity> {
  @Expose()
  Id!: number;

  @Expose()
  Name!: string;

  @Expose()
  Type!: number;

  @Expose()
  URL!: string;

  @Expose()
  GroupId!: number;

  @Expose()
  PublicURL!: string;

  toDomain() {
    return {
      Id: this.Id,
      Name: this.Name,
      Type: this.Type,
      URL: this.URL,
      GroupId: this.GroupId,
      PublicURL: this.PublicURL
    };
  }
}