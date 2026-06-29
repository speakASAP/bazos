import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID, Length, Min, IsIn, IsArray, ValidateNested, IsUrl, IsBoolean, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

const PRICE_OPTIONS = ['fixed_price', 'dohodou', 'nabidnete', 'nerozhoduje', 'v_textu', 'zdarma'] as const;
const BAZOS_MEDIA_LIMIT = 20;
const BAZOS_DESCRIPTION_MAX_LENGTH = 5000;


export class BazosMediaOverrideDto {
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

export class CreateBazosAdDraftDto {
  @IsUUID()
  identityId: string;

  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  title: string;

  @IsOptional()
  @IsString()
  @Length(0, BAZOS_DESCRIPTION_MAX_LENGTH)
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

  @IsOptional()
  @IsString()
  @Length(0, 200)
  category?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  location?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  brand?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  manufacturer?: string;

  @IsOptional()
  @IsString()
  @Length(0, 64)
  ean?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  weightKg?: number;

  @IsOptional()
  dimensionsCm?: {
    length?: number;
    width?: number;
    height?: number;
  };

  @IsOptional()
  @IsBoolean()
  saveToCatalog?: boolean;


  @IsOptional()
  @IsArray()
  @ArrayMaxSize(BAZOS_MEDIA_LIMIT)
  @ValidateNested({ each: true })
  @Type(() => BazosMediaOverrideDto)
  media?: BazosMediaOverrideDto[];
}

export class CreateBazosAdDraftFromCatalogDto {
  @IsUUID()
  identityId: string;

  @IsUUID()
  productId: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  title: string;

  @IsOptional()
  @IsString()
  @Length(0, BAZOS_DESCRIPTION_MAX_LENGTH)
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
  @IsString()
  @Length(0, 200)
  brand?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  manufacturer?: string;

  @IsOptional()
  @IsString()
  @Length(0, 64)
  ean?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  weightKg?: number;

  @IsOptional()
  dimensionsCm?: {
    length?: number;
    width?: number;
    height?: number;
  };


  @IsOptional()
  @IsArray()
  @ArrayMaxSize(BAZOS_MEDIA_LIMIT)
  @ValidateNested({ each: true })
  @Type(() => BazosMediaOverrideDto)
  media?: BazosMediaOverrideDto[];
}

export class UpdateBazosAdDraftDto {
  @IsOptional()
  @IsString()
  @Length(1, 500)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(0, BAZOS_DESCRIPTION_MAX_LENGTH)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  rubric?: string;

  @IsOptional()
  @IsIn(PRICE_OPTIONS)
  priceOption?: typeof PRICE_OPTIONS[number];

  @IsOptional()
  @IsString()
  @Length(0, 200)
  category?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  location?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  brand?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  manufacturer?: string;

  @IsOptional()
  @IsString()
  @Length(0, 64)
  ean?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  weightKg?: number;

  @IsOptional()
  dimensionsCm?: {
    length?: number;
    width?: number;
    height?: number;
  };


  @IsOptional()
  @IsArray()
  @ArrayMaxSize(BAZOS_MEDIA_LIMIT)
  @ValidateNested({ each: true })
  @Type(() => BazosMediaOverrideDto)
  media?: BazosMediaOverrideDto[];
}
