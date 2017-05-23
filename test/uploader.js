
import test from 'ava'
import path from 'path'

import uploader from '../src/uploader'

const fixtures = path.join(__dirname, 'fixtures')

test('s3-image-uploader-stream', async t => {
  const signedUrl = await uploader('./img.jpg', {
    rootDir: fixtures,
    bucket: process.env.TEST_BUCKET,
    prefix: process.env.TEST_PREFIX
  })

  t.truthy(signedUrl)
})
