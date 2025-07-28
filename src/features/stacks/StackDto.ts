
import { Expose } from "class-transformer";
import ResponseDto from "src/types/ResponseDto";
import StackEntity from "./StackEntity";

export default class StackDto extends ResponseDto<StackEntity> {
  @Expose()
  Id?: number;

  @Expose()
  Name?: string;

  @Expose()
  Type?: number;

  @Expose()
  EndpointId?: number;

  @Expose()
  SwarmId?: string;

  @Expose()
  EntryPoint?: string;

  @Expose()
  Env?: any[];

  @Expose()
  ResourceControl?: any;

  @Expose()
  Status?: number;

  @Expose()
  ProjectPath?: string;

  @Expose()
  CreationDate?: number;

  @Expose()
  CreatedBy?: string;

  @Expose()
  UpdateDate?: number;

  @Expose()
  UpdatedBy?: string;

  @Expose()
  AdditionalFiles?: any;

  @Expose()
  AutoUpdate?: any;

  @Expose()
  Option?: any;

  @Expose()
  GitConfig?: any;

  @Expose()
  FromAppTemplate?: boolean;

  @Expose()
  Namespace?: string;

  @Expose()
  IsComposeFormat?: boolean;

  toDomain() {
    return {
      Id: this.Id,
      Name: this.Name,
      Type: this.Type,
      EndpointId: this.EndpointId,
      SwarmId: this.SwarmId,
      EntryPoint: this.EntryPoint,
      Env: this.Env,
      ResourceControl: this.ResourceControl,
      Status: this.Status,
      ProjectPath: this.ProjectPath,
      CreationDate: this.CreationDate,
      CreatedBy: this.CreatedBy,
      UpdateDate: this.UpdateDate,
      UpdatedBy: this.UpdatedBy,
      AdditionalFiles: this.AdditionalFiles,
      AutoUpdate: this.AutoUpdate,
      Option: this.Option,
      GitConfig: this.GitConfig,
      FromAppTemplate: this.FromAppTemplate,
      Namespace: this.Namespace,
      IsComposeFormat: this.IsComposeFormat
    };
  }
}