import {
  type AudioPlayer,
  createAudioPlayer,
  createAudioResource,
  StreamType,
  type VoiceConnection,
} from "npm:@discordjs/voice";
// import { Buffer } from "node:buffer";
// import type { RequestOptions } from "node:https";
import ytdl from "npm:@distube/ytdl-core@^4.15.1";
import type { VideoSearchResult } from "npm:yt-search";
import yts from "npm:yt-search";
import type { PGuild } from "../types/classes/PGuild.class.ts";
import logger from "../utilities/log.utility.ts";
import { insertMusicVideo } from "./mongo.library.ts";
// import type { PGuild } from "../types/classes/PGuild.class.ts";
// import {
//   getJSONFromString,
//   isUrl,
//   joinUserVoiceChannelByReaction,
//   updateMusicLyricsMessage,
//   updateMusicMessage,
// } from "./help.library.ts";
// import { httpsFetch, scrapeLyrics } from "./http.library.ts";
// import {
//   clearMusicVote,
//   fetchGuildMusicQueue,
//   insertMusicVideo,
//   updateGuild,
// } from "./mongo.library.ts";

// export class MusicUtil {
//   private readonly client: Client;
//   private readonly guild: Guild;
//   private readonly pGuild: PGuild;

function createVideoSearchResult(
  video: VideoSearchResult,
  playlistId: string,
  index: number,
): VideoSearchResult {
  return {
    type: "video",
    videoId: video.videoId,
    url: `https://www.youtube.com/watch?v=${video.videoId}${
      playlistId ? `&list=${playlistId}&index=${index + 1}` : ""
    }`,
    title: video.title,
    description: video.description || "",
    image: video.image || "",
    thumbnail: video.thumbnail,
    seconds: video.seconds || 0,
    timestamp: video.timestamp || "",
    duration: video.duration || { seconds: 0, timestamp: "-" },
    ago: video.ago || "",
    views: video.views || 0,
    author: video.author,
  };
}

export async function searchYoutube(
  searchTerm: string,
): Promise<VideoSearchResult | null> {
  try {
    const response: { videos: VideoSearchResult[] } = await yts(searchTerm);

    if (response.videos.length === 0) {
      throw new Error(
        `Could not find anything matching "${searchTerm}" on YouTube`,
      );
    }

    return createVideoSearchResult(response.videos[0], "", 0);
  } catch (error) {
    logger.error(error);
    return null;
  }
}

async function pushVideoToQueue(
  video: VideoSearchResult,
  pGuild: PGuild,
): Promise<boolean> {
  return false;
  if (!pGuild.musicQueue) {
    pGuild.musicQueue = [];
  }

  pGuild.musicQueue.push(video);

  return await insertMusicVideo(pGuild.id, video);
}

export async function startPlayback(
  voiceConnection: VoiceConnection,
  video: VideoSearchResult,
  pGuild: PGuild,
): Promise<boolean> {
  try {
    await pushVideoToQueue(video, pGuild);

    playStream(
      pGuild.musicQueue.length > 0 ? pGuild.musicQueue[0].url : video.url,
      voiceConnection,
    );

    return true;
  } catch (error) {
    logger.error(`Error starting playback: ${error}`);
    return false;
  }
}

//   constructor(client: Client, guild: Guild, pGuild: PGuild) {
//     this.client = client;
//     this.guild = guild;
//     this.pGuild = pGuild;
//   }

//   private async popMusicQueue(): Promise<VideoSearchResult | undefined> {
//     try {
//       const music = await fetchGuildMusicQueue(this.pGuild.id);
//       if (!music) return undefined;

//       if (!music.data.pinned && music.queue.length > 0) {
//         music.queue.shift();
//         await updateGuild(this.pGuild.id, "musicQueue", music.queue);
//       }

//       this.pGuild.musicQueue = music.queue;
//       this.pGuild.musicData = music.data;

//       return music.queue.length > 0 ? music.queue[0] : undefined;
//     } catch (error) {
//       throw new Error(`Could not fetch music queue: ${error}`);
//     }
//   }

function playStream(
  videoUrl: string,
  voiceConnection: VoiceConnection,
): AudioPlayer | null {
  try {
    const stream = ytdl(videoUrl, { filter: "audioonly" });

    const resource = createAudioResource(stream, {
      inputType: StreamType.Opus,
    });

    const player: AudioPlayer = createAudioPlayer();

    player.play(resource);
    voiceConnection.subscribe(player);

    return player;
  } catch (error) {
    logger.error(`Error playing stream: ${error}`);
    return null;
  }
}

//   public async start(
//     connection: VoiceConnection | undefined,
//     user: User,
//     message: Message,
//     searchTerm: string,
//   ): Promise<string> {
//     try {
//       if (message.attachments.size > 0) {
//         return await this.handleAttachment(message, connection, user);
//       }

//       if (isUrl(searchTerm)) {
//         return await this.handleUrl(searchTerm, connection, user, message);
//       }

//       return await this.handleSearch(searchTerm, connection, user, message);
//     } catch (error) {
//       throw new Error(`Failed to start playback: ${error}`);
//     }
//   }

//   public async play(
//     connection: VoiceConnection | undefined,
//     user: User,
//   ): Promise<string> {
//     if (connection?.dispatcher?.paused) {
//       connection.dispatcher.resume();
//       return "Playback resumed";
//     }

//     try {
//       return await this.startQueuedPlayback(connection, user);
//     } catch (error) {
//       throw new Error(`Failed to start playback: ${error}`);
//     }
//   }

//   public pause(connection: VoiceConnection | undefined): string {
//     if (!connection) return "Portal is not connected";
//     if (!connection.dispatcher) return "Player is idle";
//     if (connection.dispatcher.paused) return "Already paused";

//     connection.dispatcher.pause();
//     return "Playback paused";
//   }

//   public async skip(
//     connection: VoiceConnection | undefined,
//     user: User,
//   ): Promise<string> {
//     if (connection?.dispatcher) {
//       if (connection.dispatcher.paused) {
//         setTimeout(() => {
//           connection.dispatcher.resume();
//           setTimeout(() => connection.dispatcher.end(), 200);
//         }, 200);
//       } else {
//         connection.dispatcher.end();
//       }
//       return "Skipped to queued song";
//     }

//     return await this.startQueuedPlayback(connection, user);
//   }

//   public async getLyrics(): Promise<string> {
//     if (this.pGuild.musicQueue.length === 0) {
//       await updateMusicLyricsMessage(this.guild, this.pGuild, "");
//       return "No song in queue";
//     }

//     try {
//       const searchTerm = this.formatLyricsSearchTerm();
//       const response = await this.fetchLyrics(searchTerm);
//       return await this.handleLyricsResponse(response);
//     } catch (error) {
//       throw new Error(`Failed to get lyrics: ${error}`);
//     }
//   }

//   public exportQueue(): MessageAttachment | null {
//     if (!this.pGuild.musicQueue?.length) {
//       return null;
//     }

//     const stringData = JSON.stringify(this.pGuild.musicQueue);
//     const buffer = Buffer.from(stringData, "utf-8");
//     return new MessageAttachment(buffer, "portal_video_queue.json");
//   }

//   // Volume control methods
//   public adjustVolume(
//     connection: VoiceConnection | undefined,
//     delta: number,
//   ): string {
//     if (!connection?.dispatcher) return "Player is idle";

//     const newVolume = connection.dispatcher.volume + delta;
//     if (newVolume < 0) return "Volume cannot be negative";
//     if (newVolume > 2) return "Volume cannot exceed 200%";

//     connection.dispatcher.setVolume(newVolume);
//     return `Volume ${delta > 0 ? "increased" : "decreased"} to ${
//       newVolume * 100
//     }%`;
//   }

//   private async handleAttachment(
//     message: Message,
//     connection: VoiceConnection | undefined,
//     user: User,
//   ): Promise<string> {
//     const attachment = message.attachments.find((a) => !!a);
//     if (!attachment) return "File is not a portal queue";

//     const urlPath = attachment.url.substring(26);
//     const options: RequestOptions = {
//       method: "GET",
//       hostname: "cdn.discordapp.com",
//       port: null,
//       path: urlPath,
//     };

//     try {
//       const response = await httpsFetch(options);
//       const json = getJSONFromString(
//         response.toString(),
//       ) as VideoSearchResult[];

//       if (!json) return "Data from source was corrupted";
//       if (json.length === 0) return "Must give at least one";

//       const result = await this.startPlayback(
//         connection,
//         user,
//         message,
//         json[0],
//       );

//       // Add remaining videos to queue
//       for (let i = 1; i < json.length; i++) {
//         await this.pushVideoToQueue(json[i]);
//       }

//       return result;
//     } catch (error) {
//       throw new Error(`Could not process attachment: ${error}`);
//     }
//   }

//   private async handleUrl(
//     url: string,
//     connection: VoiceConnection | undefined,
//     user: User,
//     message: Message,
//   ): Promise<string> {
//     const plistIndex = url.indexOf("list=");
//     const pindxIndex = url.indexOf("index=");
//     const videoIndex = url.indexOf("?v=");

//     if (plistIndex > 0) {
//       return await this.handlePlaylist(
//         url,
//         plistIndex,
//         pindxIndex,
//         connection,
//         user,
//         message,
//       );
//     } else if (videoIndex > 0) {
//       return await this.handleSingleVideo(
//         url,
//         videoIndex,
//         connection,
//         user,
//         message,
//       );
//     }

//     return "The URL is not a valid YouTube video or playlist";
//   }

//   private async handlePlaylist(
//     url: string,
//     plistIndex: number,
//     pindxIndex: number,
//     connection: VoiceConnection | undefined,
//     user: User,
//     message: Message,
//   ): Promise<string> {
//     const listId = url.substring(plistIndex + 5, 34);
//     const indexStr = pindxIndex > 0 ? url.substring(pindxIndex + 6) : "0";
//     const index = isNaN(+indexStr) ? 0 : +indexStr;

//     try {
//       const playlist = await yts({ listId });
//       if (playlist.videos.length <= 0) {
//         return "Could not find the playlist on YouTube";
//       }

//       await updateMusicLyricsMessage(this.guild, this.pGuild, "");

//       const initialVideo = this.createVideoSearchResult(
//         playlist.videos[index],
//         playlist.listId,
//         index,
//       );
//       const result = await this.startPlayback(
//         connection,
//         user,
//         message,
//         initialVideo,
//       );

//       // Queue remaining videos
//       for (let i = index + 1; i < playlist.videos.length; i++) {
//         const video = this.createVideoSearchResult(
//           playlist.videos[i],
//           playlist.listId,
//           i,
//         );
//         await this.pushVideoToQueue(video);
//       }

//       return result;
//     } catch (error) {
//       throw new Error(`Error handling playlist: ${error}`);
//     }
//   }

//   private async handleSingleVideo(
//     url: string,
//     videoIndex: number,
//     connection: VoiceConnection | undefined,
//     user: User,
//     message: Message,
//   ): Promise<string> {
//     const videoId = url.substring(videoIndex + 3, videoIndex + 14);

//     try {
//       const video = await yts({ videoId });
//       const searchResult = this.createVideoSearchResult(video, "", 0);
//       return await this.startPlayback(connection, user, message, searchResult);
//     } catch (error) {
//       throw new Error(`Error handling video: ${error}`);
//     }
//   }

//   private async handleSearch(
//     searchTerm: string,
//     connection: VoiceConnection | undefined,
//     user: User,
//     message: Message,
//   ): Promise<string> {
//     try {
//       const searchResult = await yts(searchTerm);
//       if (searchResult.videos.length <= 0) {
//         return `Could not find anything matching "${searchTerm}" on YouTube`;
//       }

//       return await this.startPlayback(
//         connection,
//         user,
//         message,
//         searchResult.videos[0],
//       );
//     } catch (error) {
//       throw new Error(`Error searching YouTube: ${error}`);
//     }
//   }

//   private async startPlayback(
//     connection: VoiceConnection | undefined,
//     user: User,
//     message: Message,
//     video: VideoSearchResult,
//   ): Promise<string> {
//     try {
//       await this.pushVideoToQueue(video);

//       if (connection) {
//         if (!connection.dispatcher) {
//           const dispatcher = this.spawnDispatcher(
//             this.pGuild.musicQueue?.[0] || video,
//             connection,
//           );
//           this.setupDispatcherListeners(dispatcher, connection, user);
//           return "Playback started";
//         }
//         return "Already playing, song added to queue";
//       }

//       const newConnection = await joinUserVoiceChannelByReaction(
//         this.client,
//         message,
//         this.pGuild,
//         false,
//       );

//       if (!newConnection) {
//         return "Could not join your voice channel";
//       }

//       const dispatcher = this.spawnDispatcher(
//         this.pGuild.musicQueue?.[0] || video,
//         newConnection,
//       );
//       this.setupDispatcherListeners(dispatcher, newConnection, user);
//       return "Playback started";
//     } catch (error) {
//       throw new Error(`Error starting playback: ${error}`);
//     }
//   }

function setupDispatcherListeners(
  dispatcher: StreamDispatcher,
  connection: VoiceConnection,
  user: User,
): void {
  dispatcher.once("finish", async () => {
    await handlePlaybackFinish(dispatcher, connection, user);
  });
}

async function handlePlaybackFinish(
  dispatcher: StreamDispatcher,
  connection: VoiceConnection,
  user: User,
): Promise<void> {
  try {
    if (!dispatcher.destroyed) {
      dispatcher.destroy();
    }

    // Skip to next song
    await this.skip(connection, user);

    // Clear vote state
    await clear_music_vote(this.pGuild.id);

    // Determine animation state
    const animate = connection?.dispatcher
      ? !connection.dispatcher.paused
      : false;

    // Update message display
    await update_music_message(
      this.guild,
      this.pGuild,
      this.pGuild.music_queue?.[0],
      "Next song",
      animate,
    );
  } catch (error) {
    throw new Error(`Failed to handle playback finish: ${error}`);
  }
}

//   private formatLyricsSearchTerm(): string {
//     const uselessWords = ["official", "music", "video", "ft."];
//     const expStr = uselessWords.join("|");

//     return this.pGuild.musicQueue[0].title
//       .replace(new RegExp("\\b(" + expStr + ")\\b", "gi"), " ")
//       .replace(/\s{2,}/g, " ")
//       .replace(/[&/\\#,+()$~%.'"-:*?<>{}]/g, "")
//       .split(" ")
//       .filter((s, i) => i < 6)
//       .filter((s) => s)
//       .join("%20");
//   }

//   private async fetchLyrics(searchTerm: string): Promise<Buffer> {
//     const options: RequestOptions = {
//       method: "GET",
//       hostname: "genius.p.rapidapi.com",
//       port: null,
//       path: `/search?q=${searchTerm}`,
//       headers: {
//         "x-rapidapi-host": "genius.p.rapidapi.com",
//         "x-rapidapi-key": Deno.env.get("LYRICS"),
//         "useQueryString": 1,
//       },
//     };

//     return await httpsFetch(options);
//   }

//   private async handleLyricsResponse(response: Buffer): Promise<string> {
//     const json = getJSONFromString(
//       response.toString().substring(response.toString().indexOf("{")),
//     );

//     if (!json) throw new Error("Data from source was corrupted");
//     if (json.meta.status !== 200) return "Could not fetch lyrics";
//     if (!json.response.hits.length || json.response.hits[0].type !== "song") {
//       return "Could not find song";
//     }

//     const path = json.response.hits[0].result.path;
//     const lyrics = await scrapeLyrics(`https://genius.com${path}`);

//     await updateMusicLyricsMessage(
//       this.guild,
//       this.pGuild,
//       lyrics,
//       `https://genius.com${path}`,
//     );

//     return "Displayed lyrics";
//   }
// }
