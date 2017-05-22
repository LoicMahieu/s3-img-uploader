
import path from 'path'
import s3ImgUploaderStream from './s3-img-uploader-stream'

export default function cli () {
  const yargs = require('yargs')
    .usage('$0 command')
    .option('s3Bucket', {
      describe: 'Name of the S3 bucket where the files will be stored'
    })
    .option('s3Prefix', {
      describe: 'Optional prefix for S3 keys'
    })
    .demand('s3Bucket')
    .argv

  process.stdin.pipe(s3ImgUploaderStream({
    rootDir: path.join(process.cwd(), yargs.rootDir),
    s3Bucket: yargs.s3Bucket,
    s3Prefix: yargs.s3Prefix
  }))
    .pipe(process.stdout)
}
