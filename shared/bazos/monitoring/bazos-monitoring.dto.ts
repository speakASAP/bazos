import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class ListBazosBlockedAttemptsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  @Type(() => Number)
  limit?: number;
}

export class ExpireStaleBazosSubmissionsDto {
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(1440)
  @Type(() => Number)
  maxAgeMinutes?: number;
}

export class ReconcileBazosIdentityCountsDto {
  @IsOptional()
  @IsUUID()
  identityId?: string;
}
