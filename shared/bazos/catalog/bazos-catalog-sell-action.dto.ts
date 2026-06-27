import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, IsUUID, Length, Min, ValidateNested } from 'class-validator';
import { EnqueueBazosPublishDto } from '../publisher/bazos-publisher-queue.dto';

const PRICE_OPTIONS = ['fixed_price', 'dohodou', 'nabidnete', 'nerozhoduje', 'v_textu', 'zdarma'] as const;


export class BazosCatalogMediaOverrideDto {
  @IsOptional()
  @IsString()
  @Length(1, 200)
  id?: string;

  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  url: string;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  altText?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  position?: number;
}

export class PrepareCatalogSellActionDto {
  @IsUUID()
  identityId: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  rubric?: string;

  @IsOptional()
  @IsIn(PRICE_OPTIONS)
  priceOption?: typeof PRICE_OPTIONS[number];

  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  category: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  location?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stockQuantity?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BazosCatalogMediaOverrideDto)
  media?: BazosCatalogMediaOverrideDto[];
}

export class ConfirmCatalogSellActionDto extends EnqueueBazosPublishDto {
  @IsUUID()
  adId: string;

  @IsBoolean()
  confirmed: boolean;
}

export class CatalogSellActionStatusQueryDto {
  @IsOptional()
  @IsUUID()
  adId?: string;

  @IsOptional()
  @IsUUID()
  identityId?: string;
}
