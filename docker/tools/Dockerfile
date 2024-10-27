FROM golang:1.20-bookworm

WORKDIR /usr/local

RUN apt-get update && apt-get install xz-utils unzip -y

# Install node
ENV NODE_VERSION="v18.16.0"
ARG NODE_TARGZ="node-${NODE_VERSION}-linux-x64.tar.xz"
RUN curl -LO "https://nodejs.org/dist/${NODE_VERSION}/${NODE_TARGZ}" && ls && tar -xvf "${NODE_TARGZ}" && rm "${NODE_TARGZ}"
ENV PATH="${PATH}:/usr/local/node-${NODE_VERSION}-linux-x64/bin"
RUN which node && which npm
RUN npm install -g yarn ts-proto@1.150

# Install protoc
ENV PB_VERSION="23.3"
ENV PB_FILENAME="protoc-${PB_VERSION}-linux-x86_64"
RUN curl -LO https://github.com/protocolbuffers/protobuf/releases/download/v${PB_VERSION}/${PB_FILENAME}.zip && unzip ${PB_FILENAME}.zip && rm ${PB_FILENAME}.zip
ENV PATH="${PATH}:/usr/local/bin"

RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.30
RUN go install github.com/twitchtv/twirp/protoc-gen-twirp@v8.1

# Install pressly/goose
RUN go install github.com/pressly/goose/v3/cmd/goose@v3.11

# Install mage
RUN go install github.com/magefile/mage@v1.15

# Install sqlc
RUN go install github.com/sqlc-dev/sqlc/cmd/sqlc@v1.21

RUN go install github.com/olafal0/configinator@v0.4.1
