
import path from 'path'
import s3ImgUploaderStream from './s3-img-uploader-stream'

export default function cli () {
  const yargs = require('yargs')
    .usage('$0 command')
    .option('bucket', {
      describe: 'Name of the S3 bucket where the files will be stored'
    })
    .option('prefix', {
      describe: 'Optional prefix for S3 keys'
    })
    .option('rootDir', {
      describe: 'Root directory for resovle assets'
    })
    .option('expires', {
      number: true,
      default: 60 * 60 * 24 * 365 * 20,
      describe: 'Expiration of the S3 signed url in seconds. Default: 20 years'
    })
    .option('rev', {
      boolean: true,
      default: true,
      describe: 'Enable append of "rev" in S3 file'
    })
    .option('accessKeyId', {
      describe: 'AWS access key'
    })
    .option('secretAccessKey', {
      describe: 'AWS secret key'
    })
    .demand('bucket')
    .argv

  process.stdin.pipe(s3ImgUploaderStream({
    ...yargs,
    rootDir: path.join(process.cwd(), yargs.rootDir)
  }))
    .pipe(process.stdout)
}
