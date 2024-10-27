package pictoclash

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"pictoclash/config"
	"pictoclash/db/queries"
	migration "pictoclash/db/sql"
	"pictoclash/middleware"
	"pictoclash/middleware/auth"
	"pictoclash/twirp/pb"

	"google.golang.org/protobuf/types/known/emptypb"

	_ "github.com/lib/pq"
)

type Service struct {
	config *config.PictoclashConfig
	q      *queries.Queries
	dbConn *sql.DB
	auth   auth.Authenticator
}

func NewHandler(cfg *config.PictoclashConfig) (pb.TwirpServer, http.Handler) {
	SetLogger(slog.LevelDebug)
	pictoclashSvc, err := New(cfg)
	if err != nil {
		log.Fatal(err)
	}
	twirpHandler := pb.NewPictoclashServer(pictoclashSvc)
	mux := http.NewServeMux()
	mux.Handle(twirpHandler.PathPrefix(), twirpHandler)

	handler := middleware.NewChain(
		middleware.WithDevCORSHeaders(),
		middleware.LogRequest(),
		middleware.WithAuthentication(cfg, pictoclashSvc.auth),
	).Finish(mux)
	return twirpHandler, handler
}

func New(cfg *config.PictoclashConfig) (*Service, error) {
	connStr := fmt.Sprintf(
		"host=%s port=%d user=%s dbname=postgres sslmode=disable",
		cfg.PGHost(),
		cfg.PGPort(),
		cfg.PGUsername(),
	)
	dbConn, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}
	if err := dbConn.Ping(); err != nil {
		return nil, err
	}
	q := queries.New(dbConn)

	err = migration.Up(dbConn)
	if err != nil {
		slog.Warn("migration failed", "err", err)
	}

	var verifier auth.Authenticator
	slog.Warn("no auth verifier set, skipping auth")
	verifier = &auth.InvalidAuthenticator{}

	svc := &Service{
		config: cfg,
		q:      q,
		dbConn: dbConn,
		auth:   verifier,
	}

	return svc, nil
}

func (s *Service) Noop(ctx context.Context, _ *emptypb.Empty) (*emptypb.Empty, error) {
	return &emptypb.Empty{}, nil
}

func (s *Service) withTx(ctx context.Context, txFunc func(qtx *queries.Queries) error) error {
	tx, err := s.dbConn.BeginTx(ctx, &sql.TxOptions{
		Isolation: sql.LevelDefault,
	})
	if err != nil {
		return err
	}

	err = txFunc(s.q.WithTx(tx))
	if err != nil {
		rollbackErr := tx.Rollback()
		if rollbackErr != nil {
			return rollbackErr
		}
		return err
	}
	return tx.Commit()
}

func SetLogger(level slog.Level) {
	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: level,
	}))
	slog.SetDefault(logger)
}
