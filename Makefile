
ROOT_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
NODE_MODULES = $(ROOT_DIR)/node_modules
BUILD_DIR = $(ROOT_DIR)/build

HOST ?= 127.0.0.1
PORT ?= 8080

.PHONY: build

all: install run

install: $(NODE_MODULES)

$(NODE_MODULES):
	docker run -it -v $(ROOT_DIR):/src -w /src node:9 npm install

run: $(NODE_MODULES)
	docker run -it \
	-p $(PORT):80 \
	-v $(ROOT_DIR):/src \
	-w /src \
	-e API_USER="$(API_USER)" \
	-e API_URL="$(API_URL)" \
	-e NODE_ENV="$(NODE_ENV)" \
	node:9 \
	./node_modules/.bin/webpack-dev-server --watch --host 0.0.0.0 --port 80 --public $(HOST):$(PORT)

build: $(NODE_MODULES)
	rm -rf $(BUILD_DIR)
	docker run -it \
	-v $(ROOT_DIR):/src \
	-w /src \
	-e API_USER="$(API_USER)" \
	-e API_URL="$(API_URL)" \
	-e NODE_ENV="$(NODE_ENV)" \
	node:9 npm run-script build

clean:
	rm -rf $(NODE_MODULES)
	rm -rf $(BUILD_DIR)