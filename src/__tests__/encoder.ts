import { PassThrough, Readable, Transform } from 'stream';
import { downloadFromVideo, getVideoInfo } from '../functions';
import Speaker from 'speaker';
import prism from 'prism-media';

(async () => {
    if (true) {
        const video = await getVideoInfo('gBF2TqxjJSk');

        const format = video.formats.find((c) => c.codec === 'opus' && c.hasAudio && !c.hasVideo);

        console.log(format.url);
        const download = downloadFromVideo(video, format, {
            chunkMode: {},
            pipe: false
        }) as PassThrough;

        let index = 0;

        const packets: Buffer[] = [];
        let sent = 0;

        const speaker = new Speaker({
            channels: 2,
            sampleRate: 48000,
            bitDepth: 16
        });
        download
            .pipe(new prism.opus.WebmDemuxer())
            .pipe(new prism.opus.Decoder({ channels: 2, frameSize: 960, rate: 48000 }))
            .pipe(
                new Transform({
                    readableHighWaterMark: 16384,
                    transform(chunk: Buffer, encoding, cb) {
                        console.log(`Got chunk of ${chunk.length} bytes (${index} chunks).`);
                        packets.push(chunk);
                        index++;
                        cb();
                    },
                    flush() {
                        this.emit('end');
                    }
                })
            );

        const readable = new Readable({
            highWaterMark: 3840,
            read(size) {
                console.log(size);
                const packet = packets[sent];
                if (!packet) {
                    return this.push(null);
                }
                sent++;
                this.push(packet);
            }
        });

        let retry = 15;
        const waitChunks = () => {
            download.once('data', () => {
                retry--;
                if (retry === 0) {
                    return readable.pipe(speaker);
                } else waitChunks();
            });
        };

        waitChunks();
    }
})();
