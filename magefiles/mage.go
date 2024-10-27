//go:build mage

package main

import (
	"fmt"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"

	"github.com/magefile/mage/sh"
)

const (
	serverDir        = "server"
	dockerServiceDir = "docker/service"
	dockerToolsDir   = "docker/tools"
	schemaDir        = "server/db/sql/schema"
	runDir           = "server/run"
	testDir          = "server/tests"
	webDir           = "web-next"

	dockerToolsLastBuiltFilename = ".docker-build-touch"
)

var (
	rootDir string
)

func init() {
	rootDir, _ = os.Getwd()
}

// Protogen builds protobuf messages and the twirp server
func Protogen() error {
	protoPath := "server/twirp/pictoclash"
	protoDir, err := os.ReadDir(protoPath)
	if err != nil {
		return err
	}
	protoFiles := []string{}
	for _, protoFile := range protoDir {
		if !protoFile.IsDir() && strings.HasSuffix(protoFile.Name(), ".proto") {
			protoFiles = append(protoFiles, filepath.Join(protoPath, protoFile.Name()))
		}
	}

	err = os.Chdir(serverDir)
	if err != nil {
		return err
	}

	err = sh.Run("bash", "-c", "rm -rf twirp/pb/*")
	if err != nil {
		return err
	}
	err = sh.Run("bash", "-c", "rm -rf ../web-next/pb/*")
	if err != nil {
		return err
	}

	dockerRunArgs := []string{
		"protoc",
		fmt.Sprintf("--proto_path=%s", protoPath),
		"--twirp_out=server",
		"--go_out=server",
		"--ts_proto_out=/pictoclash/web-next/pb",
		"--ts_proto_opt=env=browser,unrecognizedEnum=false,useDate=true,stringEnums=false,esModuleInterop=true",
		"--ts_proto_opt=outputEncodeMethods=true,outputJsonMethods=true,outputClientImpl=true,snakeToCamel=true",
		"--ts_proto_opt=removeEnumPrefix=true",
	}
	dockerRunArgs = append(dockerRunArgs, protoFiles...)
	return dockerRun(dockerRunArgs...)
}

// Sqlgen generates database models and queries
func Sqlgen() error {
	err := os.Chdir(serverDir)
	if err != nil {
		return err
	}

	err = sh.Run("bash", "-c", "rm -rf db/query/")
	if err != nil {
		return err
	}

	return dockerRun(
		"sqlc",
		"generate",
		"-f",
		"server/sqlc.yml",
	)
}

func ConfigGen() error {
	return dockerRunIn(
		path.Join("server", "config"),
		"configinator", "-specfile", "app_config_spec.toml",
	)
}

// MigrateUp applies the latest migrations to the local database
func MigrateUp() error {
	return dockerRun(
		"goose",
		"-dir", schemaDir,
		"postgres",
		"host=localhost port=25432 user=postgres dbname=postgres sslmode=disable",
		"up",
	)
}

// MigrateDown applies the latest migrations to the local database
func MigrateDown() error {
	return dockerRun(
		"goose",
		"-dir", schemaDir,
		"postgres",
		"host=localhost port=25432 user=postgres dbname=postgres sslmode=disable",
		"down",
	)
}

// ServiceUp brings up the supporting infrastructure locally
func ServiceUp() error {
	wd, _ := os.Getwd()
	defer os.Chdir(wd)
	err := os.Chdir(dockerServiceDir)
	if err != nil {
		return err
	}

	return sh.RunV("docker", "compose", "up", "-d")
}

// ServiceDown stops the supporting infrastructure locally
func ServiceDown() error {
	wd, _ := os.Getwd()
	defer os.Chdir(wd)
	err := os.Chdir(dockerServiceDir)
	if err != nil {
		return err
	}

	return sh.RunV("docker", "compose", "down")
}

// ServiceDestroy stops the supporting infrastructure locally and removes all volumes
func ServiceDestroy() error {
	wd, _ := os.Getwd()
	defer os.Chdir(wd)
	err := os.Chdir(dockerServiceDir)
	if err != nil {
		return err
	}

	return sh.RunV("docker", "compose", "down", "-v")
}

// ServicePurge destroys and rebuilds the local service, and performs migrations
func ServicePurge() error {
	if err := ServiceDestroy(); err != nil {
		return err
	}
	if err := ServiceUp(); err != nil {
		return err
	}
	fmt.Println("Waiting for service to come up...")
	time.Sleep(time.Second)
	if err := MigrateUp(); err != nil {
		return err
	}
	return nil
}

func Web() error {
	err := os.Chdir(webDir)
	if err != nil {
		return err
	}

	err = sh.RunV("yarn")
	if err != nil {
		return err
	}
	return sh.RunV("yarn", "dev")
}

func Run() error {
	err := os.Chdir(runDir)
	if err != nil {
		return err
	}

	return sh.RunV("./localrun.sh")
}

func Test() error {
	err := os.Chdir(testDir)
	if err != nil {
		return err
	}

	return sh.RunV("go", "run", ".")
}

func dockerToolBuild() error {
	wd, _ := os.Getwd()
	defer os.Chdir(wd)
	err := os.Chdir(rootDir)
	if err != nil {
		return err
	}
	err = os.Chdir(dockerToolsDir)
	if err != nil {
		return err
	}

	lastBuilt, _ := os.Stat(dockerToolsLastBuiltFilename)
	composeFile, _ := os.Stat("docker-compose.yml")
	dockerFile, _ := os.Stat("Dockerfile")
	if lastBuilt == nil || lastBuilt.ModTime().Before(composeFile.ModTime()) || lastBuilt.ModTime().Before(dockerFile.ModTime()) {
		fmt.Println("tools docker service outdated; rebuilding")
		err := sh.RunV("docker", "compose", "build")
		if err != nil {
			return err
		}
		_, err = os.Create(dockerToolsLastBuiltFilename)
		return err
	}
	return nil
}

func dockerRun(args ...string) error {
	return dockerRunIn("", args...)
}

func dockerRunIn(dir string, args ...string) error {
	err := os.Chdir(path.Join(rootDir, dockerToolsDir))
	if err != nil {
		return err
	}

	if err := dockerToolBuild(); err != nil {
		return err
	}
	workDir := "/pictoclash"
	if dir != "" {
		workDir = path.Join(workDir, dir)
	}
	dockerComposeArgs := []string{
		"compose",
		"run",
		"--rm", // Remove the container after execution
		"--workdir", workDir,
		"--user=1000",
		"tools", // Use docker compose service "tools"
	}
	return sh.RunV("docker",
		append(dockerComposeArgs, args...)...,
	)
}
