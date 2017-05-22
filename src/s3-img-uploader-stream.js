
import AWS from 'aws-sdk'
import asyncReplace from 'async-replace'
import async from 'async'
import mimetype from 'mimetype'
import Transform from 'readable-stream/transform'
import ary from 'lodash/ary'
import hasha from 'hasha'
import revPath from 'rev-path'
import fs from 'fs'
import path from 'path'

const reMask = /src="?([^"]+)"/g

export default function s3ImgUploaderStream (options = {
  rootDir: process.cwd(),
  s3Prefix: '',
  expires: 60 * 60 * 24 * 365 * 20,
  rev: true
}) {
  const s3 = new AWS.S3()
  const transform = (buf, enc, cb) => {
    const haystack = buf.toString(options.encoding)

    asyncReplace(haystack, reMask, (match, ...args) => {
      const cb = args.pop()
      const uri = args[0]
      const s3key = path.join(options.s3Prefix || '', uri)
      const filePath = path.join(options.rootDir, uri)
      const s3options = {
        Bucket: options.s3Bucket,
        Key: s3key
      }

      async.waterfall([
        cb => options.rev
          ? hasha.fromFile(filePath)
            .then(v => {
              s3options.Key = revPath(s3options.Key, v.slice(0, 10))
              console.log(s3options)
              cb()
            })
          : cb(),

        cb => s3.headObject({ ...s3options }, (err, data) => {
          if (!err || err.code === 'NotFound') {
            cb(null, !!data)
          } else {
            cb(err, !!data)
          }
        }),

        (exist, cb) => (
          !exist
            ? s3.upload({
              ...s3options,
              Body: fs.createReadStream(filePath),
              ContentType: mimetype.lookup(uri)
            }, ary(cb, 1))
            : cb()
        ),

        cb => s3.getSignedUrl('getObject', {
          ...s3options,
          Expires: options.expires
        }, cb),

        (url, cb) => cb(null, 'src="' + url + '"')
      ], cb)
    }, cb)
  }

  return new Transform({
    transform
  })
}
