import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';
import { EnqueueBazosPublishDto } from '../publisher/bazos-publisher-queue.dto';

const PRICE_OPTIONS = ['fixed_price', 'dohodou', 'nabidnete', 'nerozhoduje', 'v_textu', 'zdarma'] as const;

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
