import { IsNotEmpty, IsString } from 'class-validator';

export class GrantConsentDto {
  /**
   * Version of the consent text the seller was actually shown. Sent back by the
   * client so a stale page cannot silently record agreement to newer wording.
   */
  @IsString()
  @IsNotEmpty()
  documentVersion: string;
}
