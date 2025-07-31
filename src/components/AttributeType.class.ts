export class AttributeType {
  static MARKUP = new AttributeType(
    '#D3A066',
    'markup',
    '/docs/types#markup'
  );

  static STRING = new AttributeType(
    '#BAD366',
    'string',
    '/docs/types#string'
  );

  static COLOR = new AttributeType(
    '#6be1cc',
    'color',
    '/docs/types#color'
  );

  static BOOLEAN = new AttributeType(
    '#9057CD',
    'boolean',
    '/docs/types#boolean'
  );

  static NUMBER = new AttributeType(
    '#CD6457',
    'number',
    '/docs/types#number'
  );

  static COORDINATES = new AttributeType(
    '#57cd71',
    'coordinates',
    '/docs/types#coordinates'
  );

  static SELECTOR = new AttributeType(
    '#cd57c1',
    'selector',
    '/docs/types#selector'
  );

  constructor(
    public color: string,
    public name: string,
    public relativeDocsUrl: string,
  ) {}
}