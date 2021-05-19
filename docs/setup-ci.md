# Setup CI

## S3 credentials

1. Add S3 credentials to CI secrets

   ```
   S3_ACCESS_KEY: bookyp
   S3_SECRET_KEY: generateASuperSecretForThis
   ```

1. Setup minio endpoint with by using some admin credentials

   ```bash
   mc alias set geprog https://s3.geprog.com
   ```

1. Create new minio user `geprog-website`

   ```bash
   mc admin user add geprog bookyp
   mc admin policy add geprog bookyp-bucket-policy .ci/minio-policy.txt
   mc admin policy set geprog bookyp-bucket-policy user=bookyp
   ```
