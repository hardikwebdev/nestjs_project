import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { HelperService } from 'src/helper.service';
import * as fs from 'fs';

@Injectable()
export class AwsService {
  constructor(private helperService: HelperService) {}

  // Add methods for interacting with S3 here
  async uploadToAWS(type: any, file: string, path: string) {
    const contentType = {
      category: {
        type: 'image',
        regex: /^data:image\/\w+;base64,/,
      },
      blog_image: {
        type: 'image',
        regex: /^data:image\/\w+;base64,/,
      },
      blog_video: {
        type: 'video',
        regex: /^data:video\/\w+;base64,/,
      },
      testimonial: {
        type: 'image',
        regex: /^data:image\/\w+;base64,/,
      },
      aboutus_image: {
        type: 'image',
        regex: /^data:image\/\w+;base64,/,
      },
      aboutus_video: {
        type: 'video',
        regex: /^data:video\/\w+;base64,/,
      },
      slider_image: {
        type: 'image',
        regex: /^data:image\/\w+;base64,/,
      },
      site_logo: {
        type: 'image',
        regex: /^data:image\/\w+;base64,/,
      },
      profile_url: {
        type: 'image',
        regex: /^data:image\/\w+;base64,/,
      },
      home_block_image: {
        type: 'image',
        regex: /^data:image\/\w+;base64,/,
      },
    };

    const isProduction = process.env.NODE_ENV === 'prod';

    AWS.config.update({
      accessKeyId: isProduction
        ? process.env.AWS_PROD_ACCESS_KEY
        : process.env.AWS_ACCESS_KEY,
      secretAccessKey: isProduction
        ? process.env.AWS_PROD_SECRET_KEY
        : process.env.AWS_SECRET_KEY,
      region: isProduction
        ? process.env.AWS_PROD_REGION
        : process.env.AWS_REGION,
    });

    const spacesEndpoint = new AWS.Endpoint(process.env.AWS_ENDPOINT);
    const configData = isProduction ? {} : { endpoint: spacesEndpoint };
    const s3 = new AWS.S3(configData);

    const parsedFile = this.helperService.isJson(file)
      ? JSON.parse(file)
      : file;

    const base64Data = Buffer.from(
      parsedFile.replace(contentType[type].regex, ''),
      'base64',
    );
    const extension = parsedFile.split(';')[0].split('/')[1];
    const uploadPath = `${type}/${path}_${this.helperService.generateRandomString(
      5,
    )}_${this.helperService.generateRandomString(5)}.${extension}`;

    const params = {
      Bucket: isProduction
        ? process.env.AWS_PROD_BUCKET
        : process.env.AWS_BUCKET,
      Key: uploadPath,
      Body: base64Data,
      ACL: 'public-read',
      ContentType: `${contentType[type].type}/${extension}`,
    };

    const { Location } = await s3.upload(params).promise();
    const modifiedLink = this.helperService.ensureHttps(Location);
    return {
      Location: modifiedLink,
      type,
    };
  }

  async uploadImageToAWS(filePath: string, type: string, path: string) {
    const isProduction = process.env.NODE_ENV === 'prod';

    AWS.config.update({
      accessKeyId: isProduction
        ? process.env.AWS_PROD_ACCESS_KEY
        : process.env.AWS_ACCESS_KEY,
      secretAccessKey: isProduction
        ? process.env.AWS_PROD_SECRET_KEY
        : process.env.AWS_SECRET_KEY,
      region: isProduction
        ? process.env.AWS_PROD_REGION
        : process.env.AWS_REGION,
    });

    const spacesEndpoint = new AWS.Endpoint(process.env.AWS_ENDPOINT);
    const configData = isProduction ? {} : { endpoint: spacesEndpoint };
    const s3 = new AWS.S3(configData);

    const extension = filePath.split('.').pop(); // Get the file extension
    const uploadPath = `${type}/${path}_${this.helperService.generateRandomString(
      5,
    )}_${this.helperService.generateRandomString(5)}.${extension}`;

    const fileContent = fs.readFileSync(filePath);

    const params = {
      Bucket: isProduction
        ? process.env.AWS_PROD_BUCKET
        : process.env.AWS_BUCKET,
      Key: uploadPath,
      Body: fileContent,
      ACL: 'public-read',
      ContentType: `image/${extension}`, // Change to the appropriate content type
    };

    const { Location } = await s3.upload(params).promise();
    const modifiedLink = this.helperService.ensureHttps(Location);

    return {
      Location: modifiedLink,
      type,
    };
  }

  async removeFromBucket(path: string) {
    const url = this.helperService.splitURL(path);
    const isProduction = process.env.NODE_ENV === 'prod';

    AWS.config.update({
      accessKeyId: isProduction
        ? process.env.AWS_PROD_ACCESS_KEY
        : process.env.AWS_ACCESS_KEY,
      secretAccessKey: isProduction
        ? process.env.AWS_PROD_SECRET_KEY
        : process.env.AWS_SECRET_KEY,
      region: isProduction
        ? process.env.AWS_PROD_REGION
        : process.env.AWS_REGION,
    });

    const spacesEndpoint = new AWS.Endpoint(process.env.AWS_ENDPOINT);
    const configData = isProduction ? {} : { endpoint: spacesEndpoint };
    const s3 = new AWS.S3(configData);
    await s3
      .deleteObject({
        Bucket: isProduction
          ? process.env.AWS_PROD_BUCKET
          : process.env.AWS_BUCKET,
        Key: url,
      })
      .promise();
  }
}
