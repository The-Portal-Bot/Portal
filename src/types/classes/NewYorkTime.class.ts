export class Multimedia {
  public url: string;
  public format: string;
  public height: number;
  public width: number;
  public type: string;
  public subtype: string;
  public caption: string;
  public copyright: string;

  constructor(
    url: string,
    format: string,
    height: number,
    width: number,
    type: string,
    subtype: string,
    caption: string,
    copyright: string
  ) {
    this.url = url;
    this.format = format;
    this.height = height;
    this.width = width;
    this.type = type;
    this.subtype = subtype;
    this.caption = caption;
    this.copyright = copyright;
  }
}

export class Article {
  public section: string;
  public subsection: string;
  public title: string;
  public abstract: string;
  public url: string;
  public uri: string;
  public byline: string;
  public item_type: string;
  public updated_date: string;
  public created_date: string;
  public published_date: string;
  public material_type_facet: string;
  public kicker: string;
  public des_facet: string[];
  public org_facet: string[];
  public per_facet: string[];
  public geo_facet: string[];
  public multimedia: Multimedia[];
  public short_url: string;

  constructor(
    section: string,
    subsection: string,
    title: string,
    abstract: string,
    url: string,
    uri: string,
    byline: string,
    item_type: string,
    updated_date: string,
    created_date: string,
    published_date: string,
    material_type_facet: string,
    kicker: string,
    des_facet: string[],
    org_facet: string[],
    per_facet: string[],
    geo_facet: string[],
    multimedia: Multimedia[],
    short_url: string
  ) {
    this.section = section;
    this.subsection = subsection;
    this.title = title;
    this.abstract = abstract;
    this.url = url;
    this.uri = uri;
    this.byline = byline;
    this.item_type = item_type;
    this.updated_date = updated_date;
    this.created_date = created_date;
    this.published_date = published_date;
    this.material_type_facet = material_type_facet;
    this.kicker = kicker;
    this.des_facet = des_facet;
    this.org_facet = org_facet;
    this.per_facet = per_facet;
    this.geo_facet = geo_facet;
    this.multimedia = multimedia;
    this.short_url = short_url;
  }
}

export class News {
  public status: string;
  public copyright: string;
  public section: string;
  public last_updated: string;
  public num_results: number;
  public results: Article[];

  constructor(
    status: string,
    copyright: string,
    section: string,
    last_updated: string,
    num_results: number,
    results: Article[]
  ) {
    this.status = status;
    this.copyright = copyright;
    this.section = section;
    this.last_updated = last_updated;
    this.num_results = num_results;
    this.results = results;
  }
}
