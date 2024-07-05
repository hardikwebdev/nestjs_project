import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';

@Injectable()
export class HelperService {
  constructor() {}

  isJson(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (error) {
      return false;
    }
  }

  generateRandomString(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  }

  splitURL(value: string): string {
    const URLsplit = value.split('/');
    const host = `${URLsplit[0]}//${URLsplit[2]}/`;
    const newURL = value.replace(host, '');
    return newURL;
  }

  isBase64(str: string) {
    try {
      // Extract the MIME type from the base64 string
      const mime = str.split(',')[0].match(/:(.*?);/)[1];

      // Check if it's an image
      if (mime.startsWith('image/')) {
        return {
          type: 'image',
        };
      }

      // Check if it's a video
      if (mime.startsWith('video/')) {
        return {
          type: 'video',
        };
      }

      // Not an image or video
      return false;
    } catch (error) {
      return false;
    }
  }

  filterReqBody(allowedKeys: string[], incomingBodyData: any) {
    const validUpdateData = {};
    for (const key of allowedKeys) {
      if (incomingBodyData[key] !== undefined) {
        validUpdateData[key] = incomingBodyData[key];
      }
    }

    return validUpdateData;
  }

  getUrlEndpoint(originalUrl: string) {
    const urlWithoutParams = originalUrl.split('?')[0]; // Get the URL without query parameters
    const pathSegments = urlWithoutParams.split('/');

    // Get the last segment of the URL path
    const endpoint = pathSegments.pop();

    return endpoint;
  }

  ensureHttps(link: string) {
    // Check if the link starts with "https://"
    if (!link.startsWith('https://')) {
      // If not, append "https://" to the beginning of the link
      link = 'https://' + link;
    }
    return link;
  }

  async generateThumbnailFromVideo(
    videoPath: string,
    folderPath: string,
    fileName: string,
  ) {
    try {
      await new Promise((resolve) => {
        ffmpeg(videoPath)
          .on('end', () => resolve(''))
          .on('error', (err) => {
            console.log('err : ', err);
            throw err;
          })
          .screenshots({
            count: 1,
            folder: folderPath,
            filename: fileName,
            size: '640x480', // Set the desired thumbnail size
          });
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  fileExists(filePath: string) {
    // Check if the file exists
    return fs.existsSync(filePath);
  }

  deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async getVideoDuration(link: any) {
    const durationInSeconds = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(link, (err: any, metadata: any) => {
        if (!err) {
          // resolve(metadata.format.duration.toFixed(2));
          const totalSeconds = metadata.format.duration;
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = Math.floor(totalSeconds % 60);

          const formattedDuration = `${minutes}:${seconds
            .toString()
            .padStart(2, '0')}`;
          resolve(formattedDuration);
        } else {
          console.error('Error retrieving video duration:', err);
          reject(0);
        }
      });
    });
    return durationInSeconds;
  }
}
