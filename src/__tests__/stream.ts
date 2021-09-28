import { getVideoInfo } from '../functions/getVideoInfo';
import { downloadFromVideo } from '../functions/downloadFromVideo';
import { Client, Guild, Intents } from 'discord.js';
import {
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    DiscordGatewayAdapterCreator,
    entersState,
    joinVoiceChannel,
    VoiceConnectionStatus
} from '@discordjs/voice';
const ms = Date.now();

const client = new Client({
    intents: Object.values(Intents.FLAGS)
});

client.on('ready', async () => {
    console.log(`Bot is ready!`);

    const guild = client.guilds.cache.get('773352845738115102') as Guild;

    const connection = joinVoiceChannel({
        channelId: '816751491451977768',
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
    });

    await entersState(connection, VoiceConnectionStatus.Ready, 5000);

    const player = createAudioPlayer();

    connection.subscribe(player);

    const video = await getVideoInfo('https://www.youtube.com/watch?v=f8HtmFtGSQo');

    if (!video) {
        return;
    }

    const format = video.formats.find(
        (c) => c.url && c.audioBitrate === 48 && c.hasAudio && !c.hasVideo && c.codec === 'opus'
    );

    player.on('error', (e) => {
        console.log(`Audio error`, e.message);
    });
    player.on('stateChange', (o, n) => {
        console.log(o.status, n.status);
        if (o.status === AudioPlayerStatus.Playing && n.status === AudioPlayerStatus.Idle) {
            player.play(
                createAudioResource(
                    downloadFromVideo(video, format, {
                        chunkMode: {
                            chunkSize: 512000
                        },
                        highWaterMark: 16384
                    })
                )
            );
        }
    });

    const stream = downloadFromVideo(video, format, {
        chunkMode: {}
    });

    player.play(createAudioResource(stream));
});

// Hidden file
import config from './config.json';

client.login(config.token);
