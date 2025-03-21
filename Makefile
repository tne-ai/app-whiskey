# Makefile for richtong/lib
#
# Release tag
TAG=0.9
APP ?= $(shell basename $(CURDIR))

# adjust this for where ./src/lib is and add your own
INCLUDE_DIRS ?= $(WS_DIR)/git/src/lib
# adjust for your org
ORG ?= tne

## install: Install App-Whiskey
.PHONY: install
install:
	cd FrontEnd && npm install

## run: Run app-whiskey (start backend first)
.PHONY: run
run: backend frontend

## whiskey.kill: kill app-whiskey frontend
.PHONY: whiskey.kill
whiskey.kill:
	pfkill -fl app-whiskey

## kill: all ai processes
.PHONY: whiskey.kill ai.kill
kill:
	cd $(WS_DIR)/git/src && make ai.kill

## open: open the front and backend host windows
.PHONY: open
open:
	open http://localhost:5174
	open http://localhost:6574

## frontend: Run the Frontend
.PHONY: frontend
frontend:
	cd FrontEnd && direnv exec . npm run dev &

## frontend.kill: kill the Frontend assumes the app name is the current directory
.PHONY: frontend.kill
frontend.kill:
	pkill -f $(APP)

## backend: Run OpenWebui
.PHONY: backend
backend:
	cd $(WS_DIR)/git/src && make ai.dev

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
