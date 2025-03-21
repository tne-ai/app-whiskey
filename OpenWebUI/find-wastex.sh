#!/usr/bin/env bash
# finds the wastes from the big json
# juse yq -P to turn it into yaml
cat "$@" | jq '.[] | select(.id | startswith("wastex"))'
