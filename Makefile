install:
	npm ci
lint:
	npx eslint .
server:
	npx webpack serve
remove:
	rm -rf dist
build:
	NODE_ENV=production npx webpack
