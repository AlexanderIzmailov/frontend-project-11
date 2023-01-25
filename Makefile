install:
	npm ci

develop:
	npx webpack serve

lint:
	npx eslint .

build:
	rm -rf dist
	NODE_ENV=production NODE_OPTIONS=--openssl-legacy-provider npx webpack
