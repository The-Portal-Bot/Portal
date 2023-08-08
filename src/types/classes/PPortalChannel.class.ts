import { Document } from 'mongoose';
import { PVoiceChannel } from './PVoiceChannel.class';

export class PChannel {
  public id: string;
  public creatorId: string;
  public render: boolean;
  public regexPortal: string;
  public regexVoice: string;
  public pVoiceChannels: PVoiceChannel[];
  public noBots: boolean;
  public allowedRoles: [string] | null;
  public locale: number;
  public annAnnounce: boolean;
  public annUser: boolean;
  public userLimitPortal: number;
  public regexOverwrite: boolean;

  constructor(
    id: string,
    creatorId: string,
    render: boolean,
    regexPortal: string,
    regexVoice: string,
    voiceList: PVoiceChannel[],
    noBots: boolean,
    allowedRoles: [string] | null,
    locale: number,
    annAnnounce: boolean,
    annUser: boolean,
    userLimitPortal: number,
    regexOverwrite: boolean
  ) {
    this.id = id;
    this.creatorId = creatorId;
    this.render = render;
    this.regexPortal = regexPortal;
    this.regexVoice = regexVoice;
    this.pVoiceChannels = voiceList;
    this.noBots = noBots;
    this.allowedRoles = allowedRoles;
    this.locale = locale;
    this.annAnnounce = annAnnounce;
    this.annUser = annUser;
    this.userLimitPortal = userLimitPortal;
    this.regexOverwrite = regexOverwrite;
  }
}

export interface IPChannel extends Document {
  id: string;
  creatorId: string;
  render: boolean;
  regexPortal: string;
  regexVoice: string;
  voiceList: [PVoiceChannel];
  noBots: boolean;
  allowedRoles: [string] | null;
  locale: number;
  annAnnounce: boolean;
  annUser: boolean;
  userLimitPortal: number;
  regexOverwrite: boolean;
}
