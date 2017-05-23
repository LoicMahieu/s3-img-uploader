
import test from 'ava'
import fs from 'fs'
import path from 'path'
import streamToPromise from 'stream-to-promise'

import s3ImgUploaderStream from '../src/s3-img-uploader-stream'

const fixtures = path.join(__dirname, 'fixtures')

test('s3-image-uploader-stream', async t => {
  const result = (await streamToPromise(
    fs.createReadStream(fixtures + '/example.html')
      .pipe(s3ImgUploaderStream({
        rootDir: fixtures,
        bucket: process.env.TEST_BUCKET,
        prefix: process.env.TEST_PREFIX
      }))
  )).toString()

  t.truthy(result)
})
