install:
	npm ci
lint:
	npx eslint .
test:
	npm test
s:
	npx webpack serve
remove:
	rm -rf dist
pack:
	NODE_ENV=production npx webpack
