#!/bin/bash

set -uex -o pipefail

MANIFESTS_DIR=kube-prometheus-manifests/

rm -rf $MANIFESTS_DIR
mkdir -p $MANIFESTS_DIR/setup
jsonnet -J vendor -m $MANIFESTS_DIR kube-prometheus.jsonnet | xargs -I{} sh -c 'cat {} | gojsontoyaml > {}.yaml' -- {}
find $MANIFESTS_DIR -type f ! -name '*.yaml' -delete
