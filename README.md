# file uploader

Сохраняйте файлы и делитесь по ссылке.

Features: 
- удаляет Exif данные из файлов.
- загружайте файлы до 100мб
- история загрузок (local storage)
- превью картинок и видео

## License

### TL;DR

The AGPL 3.0 license requires anyone who modifies or distributes the software to make their source code available to end-users when the software is used over a network. It's like the GPL but with extra coverage for network usage.

## Developing

Once you've cloned the project and installed dependencies with `bun install` start a development server:

add your s3 env vars 
- S3_ACCESS_KEY_ID
- S3_SECRET_ACCESS_KEY
- S3_BUCKET
- S3_ENDPOINT
- S3_REGION

```bash
bun run dev
```

## Building

To create a production version:

```bash
bun run build
```
