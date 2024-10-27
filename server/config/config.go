// Code generated from app_config_spec.toml. DO NOT EDIT.

package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"
)

type PictoclashEnvironment string

const (
	PictoclashEnvironmentLocal PictoclashEnvironment = "local"
	PictoclashEnvironmentDev   PictoclashEnvironment = "dev"
	PictoclashEnvironmentProd  PictoclashEnvironment = "prod"
)

type PictoclashConfig struct {
	environment PictoclashEnvironment
	pghost      string
	pgpassword  string
	pgport      int64
	pgusername  string
}

func NewPictoclashConfigFromEnv() (*PictoclashConfig, error) {
	cfg := &PictoclashConfig{}

	if environment, ok := os.LookupEnv("PICTOCLASH_DEPLOY_ENV"); ok {
		switch PictoclashEnvironment(environment) {
		case PictoclashEnvironmentLocal:
			cfg.environment = PictoclashEnvironmentLocal
		case PictoclashEnvironmentDev:
			cfg.environment = PictoclashEnvironmentDev
		case PictoclashEnvironmentProd:
			cfg.environment = PictoclashEnvironmentProd
		default:
			return nil, fmt.Errorf("unexpected PICTOCLASH_DEPLOY_ENV value: '%s'", environment)
		}
	} else {
		return nil, errors.New("required option missing: PICTOCLASH_DEPLOY_ENV")
	}

	if pghost, ok := os.LookupEnv("PICTOCLASH_PG_HOST"); ok {
		cfg.pghost = pghost
	} else {
		cfg.pghost = "localhost"
	}

	if pgpassword, ok := os.LookupEnv("PICTOCLASH_PG_PASSWORD"); ok {
		cfg.pgpassword = pgpassword
	} else {
		return nil, errors.New("required option missing: PICTOCLASH_PG_PASSWORD")
	}

	if pgport, ok := os.LookupEnv("PICTOCLASH_PG_PORT"); ok {
		if converted, err := strconv.ParseInt(pgport, 10, 64); err == nil {
			cfg.pgport = converted
		} else {
			return nil, err
		}
	} else {
		cfg.pgport = 25432
	}

	if pgusername, ok := os.LookupEnv("PICTOCLASH_PG_USERNAME"); ok {
		cfg.pgusername = pgusername
	} else {
		cfg.pgusername = "postgres"
	}

	return cfg, nil
}

func (c *PictoclashConfig) PictoclashEnvironment() PictoclashEnvironment {
	return c.environment
}
func (c *PictoclashConfig) IsEnvironmentLocal() bool {
	return c.environment == PictoclashEnvironmentLocal
}
func (c *PictoclashConfig) IsEnvironmentDev() bool {
	return c.environment == PictoclashEnvironmentDev
}
func (c *PictoclashConfig) IsEnvironmentProd() bool {
	return c.environment == PictoclashEnvironmentProd
}
func (c *PictoclashConfig) PGHost() string {
	return c.pghost
}
func (c *PictoclashConfig) PGPassword() string {
	return c.pgpassword
}
func (c *PictoclashConfig) PGPort() int64 {
	return c.pgport
}
func (c *PictoclashConfig) PGUsername() string {
	return c.pgusername
}
