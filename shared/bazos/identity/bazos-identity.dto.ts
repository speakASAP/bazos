import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString, Length } from 'class-validator';
import { EncryptedBazosSessionEnvelope } from './bazos-identity.types';

export class CreateBazosIdentityDto {
  @IsString()
  @IsNotEmpty()
  @Length(9, 20)
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  displayName: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  contactName?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  contactPhone?: string;

  @IsOptional()
  @IsString()
  @Length(0, 20)
  defaultZip?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  defaultLocation?: string;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBazosIdentityDto {
  @IsOptional()
  @IsString()
  @Length(1, 200)
  displayName?: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  defaultZip?: string;

  @IsOptional()
  @IsString()
  defaultLocation?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class MarkChallengeDto {
  @IsString()
  @IsNotEmpty()
  challengeState: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class StartVerificationSessionDto {
  @IsOptional()
  @IsString()
  verificationUrl?: string;

  @IsOptional()
  expiresAt?: Date | string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CompleteVerificationSessionDto {
  @IsBoolean()
  humanConfirmed: boolean;

  @IsObject()
  encryptedSession: EncryptedBazosSessionEnvelope;

  @IsOptional()
  verificationExpiresAt?: Date | string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class VerificationSessionChallengeDto extends MarkChallengeDto {}

export class ExpireVerificationSessionDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class MarkVerifiedDto extends CompleteVerificationSessionDto {}
