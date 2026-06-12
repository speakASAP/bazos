import { IsString, IsOptional, IsNotEmpty, Length, Matches } from 'class-validator';

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

export class MarkVerifiedDto {
  @IsOptional()
  verificationExpiresAt?: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}
