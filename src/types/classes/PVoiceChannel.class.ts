import { Document } from 'mongoose';

export class PVoiceChannel {
  public id: string;
  public creatorId: string;
  public render: boolean;
  public regex: string;
  public noBots: boolean;
  public locale: number;
  public annAnnounce: boolean;
  public annUser: boolean;

  constructor(
    id: string,
    creatorId: string,
    render: boolean,
    regex: string,
    noBots: boolean,
    locale: number,
    annAnnounce: boolean,
    annUser: boolean
  ) {
    this.id = id;
    this.creatorId = creatorId;
    this.render = render;
    this.regex = regex;
    this.noBots = noBots;
    this.locale = locale;
    this.annAnnounce = annAnnounce;
    this.annUser = annUser;
  }
}

export interface IPVoiceChannel extends Document {
  id: string;
  creatorId: string;
  render: boolean;
  regex: string;
  noBots: boolean;
  locale: number;
  annAnnounce: boolean;
  annUser: boolean;
}
