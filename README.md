# s3-batch-manifest-gen

> format = `${bucket}/${contextPath}/dt=${from..to}` all objects

For example

- bucket: archiveBucket
- from: 2023-01-24
- to: 2023-01-25
- contextPath = dev/logs
- output = manifext.csv

```plaintext
bucket: archiveBucket, prefix: dev/logs/dt=20230124
bucket: archiveBucket, prefix: dev/logs/dt=20230125
```


CLI options types

```plaintext
sourceBucket: string
from: timestamp(ISO8601 String)
to: timestamp(ISO8601 String)
contextPath: string(basePath)
output: string
```

```bash
npx s3-batch-manifest-gen --sourceBucket=$BUCKET_NAME \
  --from=2022-06-30 \
  --to=2023-01-31 \
  --output=manifest.csv \
  --contextPath=dev/logs
```
