import AWS from 'aws-sdk'
import log from '../logger.mjs'
import { config } from 'dotenv'

config()

const {
  RTCSTATS_S3_BUCKET,
  AWS_REGION,
  LOCALSTACK_ENDPOINT
} = process.env

let configParam = {
    region: AWS_REGION
}

if (typeof LOCALSTACK_ENDPOINT === "string" ) {
    configParam = {
        endpoint: LOCALSTACK_ENDPOINT,
        s3ForcePathStyle: true,
        ...configParam
    }
}

AWS.config.update(configParam)

const s3 = new AWS.S3()

export const fileExists = async Key => {
  const obj = { Bucket: RTCSTATS_S3_BUCKET, Key }

  try {
    const code = await s3.headObject(obj).promise()
    log.info('File exists in bucket', { obj, code })

    return true
  } catch (err) {
    log.error('Error finding the file in bucket', { obj, err })

    return false
  }
}

export const getFileStream = Key => {
  const obj = { Bucket: RTCSTATS_S3_BUCKET, Key }
  const stream = s3.getObject({ Bucket: RTCSTATS_S3_BUCKET, Key }).createReadStream()

  log.info('Start streaming file %s', Key)

  // errors on service
  stream.on('error', err => {
    log.error('Error streaming file', { obj, err })
  })

  return stream
}
