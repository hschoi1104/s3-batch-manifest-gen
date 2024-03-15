import {
  S3Client,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  _Object,
} from '@aws-sdk/client-s3';

import fs from 'fs';
import minimist from 'minimist';

async function list(
  Bucket: string,
  Prefix: string,
  MaxKeys = 1000,
  NextContinuationToken: string | undefined | null,
  client: S3Client,
) {
  const command = new ListObjectsV2Command({
    Bucket,
    Prefix,
    MaxKeys,
    ...(NextContinuationToken != null
      ? {
          ContinuationToken: NextContinuationToken,
        }
      : {}),
  });

  return client.send(command);
}

export async function main() {
  // cli options
  // --sourceBucket
  // --region
  // --contextPath  # /signatures
  // --output
  const args = minimist(process.argv.slice(2), {
    string: ['sourceBucket', 'region', 'contextPath', 'output'],
  });
  const { sourceBucket, region, contextPath, output } = args;
  const client = new S3Client({
    region,
  });

  let hasMoreFiles: boolean | undefined = false;
  let continuationToken: string | undefined | null = null;
  const stream = fs.createWriteStream(output, { flags: 'a' });

  const prefix = `${contextPath}`;

  console.log(`bucket: ${sourceBucket}, prefix: ${prefix}`);
  do {
    const response: ListObjectsV2CommandOutput = await list(
      sourceBucket,
      prefix,
      1000,
      continuationToken,
      client,
    );
    response?.Contents?.forEach((object: _Object) => {
      stream.write(`${sourceBucket},${object.Key}\r\n`);
    });
    hasMoreFiles = response.IsTruncated;
    continuationToken = hasMoreFiles ? response.NextContinuationToken : null;
  } while (hasMoreFiles);

  stream.end();
  console.log('done');
}
