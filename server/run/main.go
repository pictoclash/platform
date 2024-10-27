package main

import (
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"pictoclash/config"
	"pictoclash/pictoclash"
)

func main() {
	cfg, err := config.NewPictoclashConfigFromEnv()
	if err != nil {
		log.Fatal(err)
	}
	twirpHandler, handler := pictoclash.NewHandler(cfg)

	slog.Info("server started", "url", fmt.Sprintf("localhost:8007%s", twirpHandler.PathPrefix()))
	log.Fatal(http.ListenAndServe(":8007", handler))
}
