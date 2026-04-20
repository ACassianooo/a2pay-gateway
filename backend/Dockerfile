# Build stage
FROM golang:1.26-alpine AS builder

WORKDIR /app

# Copiar go.mod e go.sum de dentro da pasta backend
COPY go.mod go.sum ./
RUN go mod download

# Copiar todo o código da pasta backend
COPY . .

# Compilar o binário (ajustar o caminho do main se necessário)
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api/main.go

# Run stage
FROM alpine:latest
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copiar o binário do builder
COPY --from=builder /app/main .

# O Railway configura a porta dinamicamente via ENV
EXPOSE 8080

CMD ["./main"]
