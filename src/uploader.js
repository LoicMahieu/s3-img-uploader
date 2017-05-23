
import AWS from 'aws-sdk'
import mimetype from 'mimetype'
import hasha from 'hasha'
import revPath from 'rev-path'
import fs from 'fs'
import path from 'path'

export default async (uri, {
  rootDir = process.cwd(),
  accessKeyId,
  secretAccessKey,
  bucket,
  prefix = '',
  expires = 60 * 60 * 24 * 365 * 20,
  rev = true
} = {}) => {
  const s3 = new AWS.S3({
    accessKeyId,
    secretAccessKey
  })

  const filePath = path.join(rootDir, uri)
  const s3options = {
    Bucket: bucket,
    Key: path.join(prefix || '', uri)
  }

  if (rev) {
    const rev = await hasha.fromFile(filePath)
    s3options.Key = revPath(s3options.Key, rev.slice(0, 10))
  }

  let exists = false
  try {
    const object = await s3.headObject({ ...s3options }).promise()
    exists = !!object
  } catch (err) {
    if (err.code !== 'NotFound') {
      throw err
    }
  }

  if (!exists) {
    await s3.upload({
      ...s3options,
      Body: fs.createReadStream(filePath),
      ContentType: mimetype.lookup(uri)
    }).promise()
  }

  const signedUrl = s3.getSignedUrl('getObject', {
    ...s3options,
    Expires: expires
  })

  return signedUrl
}
