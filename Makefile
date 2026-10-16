.PHONY: build start test validate qa docker-up docker-down

build:
	npm run build

start:
	node dist/server/src/server.js

test:
	npm test

validate:
	npm run validate

qa:
	npm run qa

docker-up:
	docker compose up --build app

docker-down:
	docker compose down
