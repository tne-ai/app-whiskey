# Makefile for any $(APP)
#
# Release tag
TAG=0.9
APP ?= $(shell basename $(CURDIR))

# adjust this for where ./src/lib is and add your own
INCLUDE_DIRS ?= $(WS_DIR)/git/src/lib
# adjust for your org
ORG ?= tne

## install: Install $(APP)
.PHONY: install
install:
	cd FrontEnd && npm install

## run: Run $(APP) (start backend first)
.PHONY: run
run: backend frontend open

## kill: kill app-whiskey frontend
.PHONY: kill
kill: backend.kill frontend.kill
	pfkill -fl "$(APP)"

## open: open the front and backend host windows
.PHONY: open
open:
	open http://localhost:5174
	open http://localhost:6573
	open http://localhost:8888
	open http://localhost:9998

## frontend: Run the Frontend
# usage: $(call start_server,port of service, app, arguments...)
.PHONY: frontend
frontend:
	$(call start_server,6573,cd FrontEnd && npm run dev)

## frontend.kill: kill the Frontend assumes the app name is the current directory
.PHONY: frontend.kill
frontend.kill:
	pkill -f $(APP)

## backend: Run OpenWebui and Jupyter to run code
.PHONY: backend
backend:
	cd $(WS_DIR)/git/src && make ai.dev ai.extras

## backend: Kill backend
.PHONY: backend.kill
backend.kill:
	cd "$(WS_DIR)/git/src" && make ai.kill

## Local Make commands
## ---
## test: test the library
.PHONY: test
test:
	@echo "insert test code here..."

## clean: remove the build directory
.PHONY: clean
clean:
	@echo "insert clear code here..."

## all: build all
.PHONY: all

# list these in reverse order so the most general is last

# Adjust these assuming this is a ./src submodule
# https://www.gnu.org/software/make/manual/html_node/Foreach-Function.html
# Note that - means to ignore errors, but this is actually checks
# LIB_PATH ?= ../lib
# ifneq ($(wildcard include.mk),)
# include "$(LIB_PATH)/include.mk"
# endif
-include $(INCLUDE_DIRS)/include.mk
-include $(INCLUDE_DIRS)/include.ai.mk
# -include $(INCLUDE_DIRS)/include.airflow.mk
# -include $(INCLUDE_DIRS)/include.docker.mk
# -include $(INCLUDE_DIRS)/include.gcp.base.mk
# -include $(INCLUDE_DIRS)/include.gcp.mk
# -include $(INCLUDE_DIRS)/include.hugo.mk
# -include $(INCLUDE_DIRS)/include.jupyter.mk
# -include $(INCLUDE_DIRS)/include.node.mk
# -include $(INCLUDE_DIRS)/include.python.mk
# -include $(INCLUDE_DIRS)/include.rhash.mk

# normally your organization stuff appears last
-include $(INCLUDE_DIRS)/include.$(ORG).mk
