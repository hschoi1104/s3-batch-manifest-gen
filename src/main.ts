import {
  S3Client,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  _Object,
} from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-providers'; // ES6 import
import { parseISO, format, eachDayOfInterval } from 'date-fns';

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
  // --contextPath
  // --from
  // --to
  // --output

  const args = minimist(process.argv.slice(2), {
    string: ['sourceBucket', 'contextPath', 'fromt', 'to', 'output'],
  });
  const { sourceBucket, contextPath } = args;
  const { from, to, output } = args;
  const client = new S3Client({ credentials: fromIni() });
  const fromDate = parseISO(from);
  const toDate = parseISO(to);

  let hasMoreFiles: boolean | undefined = false;
  let continuationToken: string | undefined | null = null;
  const stream = fs.createWriteStream(output, { flags: 'a' });

  const dates = eachDayOfInterval({
    start: fromDate,
    end: toDate,
  });

  for (const index in dates) {
    const date = dates[index];
    const prefix = `${contextPath}/dt=${format(date, 'yyyyMMdd')}`;
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
  }
  stream.end();
}
