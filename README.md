# s3-batch-manifest-gen

> format = `${bucket}/${contextPath}/` all objects

For example

- bucket: archiveBucket
- contextPath = dev/logs
- output = manifext.csv

```plaintext
bucket: archiveBucket, prefix: dev/logs/dt=20230124
bucket: archiveBucket, prefix: dev/logs/dt=20230125
```


CLI options types

```plaintext
sourceBucket: string
region: string
contextPath: string(basePath)
output: string
```

```bash
npx s3-batch-manifest-gen --sourceBucket=$BUCKET_NAME \
  --region=ap-northeast-2
  --output=manifest.csv \
  --contextPath=dev/logs
```
