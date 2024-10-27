FROM golang:1.23 AS builder

WORKDIR /app
COPY . .
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o /server-bin ./run/

FROM scratch AS runner
WORKDIR /
COPY --from=builder /server-bin /server-bin

EXPOSE 8007

CMD ["/server-bin"]
