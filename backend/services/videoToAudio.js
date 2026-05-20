import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

ffmpeg.setFfmpegPath(ffmpegPath);

const convertVideoToAudio = (input, output) => {
  return new Promise((resolve, reject) => {
    ffmpeg(input).noVideo().save(output).on("end", resolve).on("error", reject);
  });
};

export default convertVideoToAudio;
