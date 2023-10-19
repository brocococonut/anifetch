FROM node:lts AS builder
WORKDIR /build

COPY ./package.json .
COPY ./yarn.lock .
RUN yarn

COPY . .
RUN yarn run build

# 
# Production image
FROM node:lts-alpine

WORKDIR /app

# Add bash and curl
RUN apk add --no-cache bash curl python3 py3-pip ffmpeg tini
RUN python3 -m pip install yt-dlp

COPY --from=builder /build/package.json .
COPY --from=builder /build/yarn.lock .
RUN yarn --production

COPY --from=builder /build/dist ./dist

RUN mkdir /logs /downloads /downloads-tmp

ENV HOST=0.0.0.0
ENV PORT=4321
ENV EXTRACTOR=/usr/bin/ffmpeg
ENV BIN_PATH=/usr/bin/yt-dlp
ENV LOG=true
ENV LOG_DIR=/logs
ENV OUT_FOLDER=/downloads
ENV OUT_FILENAME="%(title)s-%(id)s.%(ext)s"

EXPOSE 4321

USER node

ENTRYPOINT ["/sbin/tini", "--"]

# RUN pkgx --version
CMD ["node", "./dist/server/entry.mjs"]