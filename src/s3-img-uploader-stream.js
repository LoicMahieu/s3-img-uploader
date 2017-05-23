
import asyncReplace from 'async-replace'
import Transform from 'readable-stream/transform'

import uploader from './uploader'

const reMask = /src="?([^"]+)"/g

export default function s3ImgUploaderStream (options = {}) {
  const transform = (buf, enc, cb) => {
    const haystack = buf.toString(options.encoding)

    asyncReplace(haystack, reMask, (match, ...args) => {
      const cb = args.pop()
      const uri = args[0]

      uploader(uri, options)
        .then(signedUrl => cb(null, 'src="' + signedUrl + '"'))
        .catch(err => cb(err))
    }, cb)
  }

  return new Transform({
    transform
  })
}
