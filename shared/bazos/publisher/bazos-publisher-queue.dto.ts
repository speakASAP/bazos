import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';
import { REVIEW_STATE } from '../identity/bazos-identity.types';

const CHALLENGE_STATES = Object.values(REVIEW_STATE).filter((state) => state !== REVIEW_STATE.CLEAR);
const EVIDENCE_SOURCES = ['manual_review', 'trusted_backend'] as const;

export class PublicDuplicateEvidenceDto {
  @IsDateString()
  checkedAt: string;

  @IsIn(EVIDENCE_SOURCES)
  source: typeof EVIDENCE_SOURCES[number];

  @IsBoolean()
  likelyDuplicate: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class ContentPolicyEvidenceDto {
  @IsDateString()
  checkedAt: string;

  @IsIn(EVIDENCE_SOURCES)
  source: typeof EVIDENCE_SOURCES[number];

  @IsBoolean()
  passed: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class PublishEvidenceDto {
  @Type(() => PublicDuplicateEvidenceDto)
  publicDuplicateCheck: PublicDuplicateEvidenceDto;

  @Type(() => ContentPolicyEvidenceDto)
  contentPolicy: ContentPolicyEvidenceDto;
}

export class EnqueueBazosPublishDto extends PublishEvidenceDto {}

export class ClaimBazosPublishDto extends PublishEvidenceDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}

export class ListBazosPublishQueueDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  identityId?: string;

  @IsOptional()
  @IsUUID()
  adId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}

export class RecordBazosPublishResultDto {
  @IsBoolean()
  success: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  bazosAdId?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsIn(CHALLENGE_STATES)
  challengeState?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  error?: string;
}
