import { Expose } from "class-transformer";
import EndpointEntity from "../../types/EndpointEntity";
import ResponseDto from "src/types/ResponseDto";

export default class EndpointDto extends ResponseDto<EndpointEntity> {
  @Expose()
  Id?: number;

  @Expose()
  Name?: string;

  @Expose()
  Type?: number;

  @Expose()
  URL?: string;

  @Expose()
  GroupId?: number;

  @Expose()
  PublicURL?: string;

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