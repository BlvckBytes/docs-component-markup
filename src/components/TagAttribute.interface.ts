import { AttributeType } from './AttributeType.class';

export interface TagAttribute {
  name: string;
  aliases: string[];
  description: string | string[],
  fallback: string | null;
  multiValue: boolean;
  type: AttributeType
}