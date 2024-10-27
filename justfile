set quiet
set shell := ["bash", "-c"]
protoPath := "server/twirp/pictoclash"

default:
	just --list

[doc('Copy local artifacts to the server')]
update-files:
	scp /tmp/pictoclash.tar private/.env.server infra/docker-compose.yml infra/Caddyfile $TARGET_HOST:~/

[doc('Build a new server image and copy it to the server, along with other local artifacts')]
update-bin:
	@docker build -t pictoclash ./server
	docker save -o /tmp/pictoclash.tar pictoclash
	just update-files
	ssh $TARGET_HOST sudo docker load -i pictoclash.tar

[doc('Build and deploy the server image to the target host')]
deploy:
	echo "Deploying to $TARGET_HOST"
	if [ -z "$TARGET_HOST" ]; then echo "TARGET_HOST is not set"; exit 1; fi
	just update-bin
	@ssh $TARGET_HOST sudo docker compose up app --force-recreate -d

[doc('Start tailing server logs')]
logs:
	ssh -t $TARGET_HOST sudo docker compose logs -f app

proto:
	mage protogen
