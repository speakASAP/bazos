import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID, Length, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

const PRICE_OPTIONS = ['fixed_price', 'dohodou', 'nabidnete', 'nerozhoduje', 'v_textu', 'zdarma'] as const;

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
}

export class UpdateBazosAdDraftDto {
  @IsOptional()
  @IsString()
  @Length(1, 500)
  title?: string;

  @IsOptional()
  @IsString()
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
}
