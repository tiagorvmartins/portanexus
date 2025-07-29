export default interface StackEntity {
  Id: number;
  Name: string;
  Type?: number;
  EndpointId?: number;
  SwarmId?: string;
  EntryPoint?: string;
  Env?: any[];
  ResourceControl?: any;
  Status?: number;
  ProjectPath?: string;
  CreationDate: number;
  CreatedBy?: string;
  UpdateDate?: number;
  UpdatedBy?: string;
  AdditionalFiles?: any;
  AutoUpdate?: any;
  Option?: any;
  GitConfig?: any;
  FromAppTemplate?: boolean;
  Namespace?: string;
  IsComposeFormat?: boolean;
}
