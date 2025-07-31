import { TagAttribute } from './TagAttribute.interface';

export interface TagDoc {
  name: string;
  aliases: string[];
  selfClosing: boolean;
  attributes: TagAttribute[];
}