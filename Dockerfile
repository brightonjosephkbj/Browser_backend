FROM node:20-slim

# Install ffmpeg, python3, pip and yt-dlp
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    --no-install-recommends && \
    pip3 install yt-dlp --break-system-packages && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json .
RUN npm install

COPY index.js .

RUN mkdir -p downloads converted thumbnails

EXPOSE 3001

CMD ["node", "index.js"]
