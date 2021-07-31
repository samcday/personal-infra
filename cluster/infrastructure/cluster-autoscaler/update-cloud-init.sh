#!/bin/bash

# Avert thine eyes, lest ye be tainted by the evil spirits below.
sops -i -e --set "[\"spec\"][\"secretTemplates\"][0][\"stringData\"][\"data\"] \"$(cat cloud-init.txt | sed -e "s/_TOKEN_/$K3S_TOKEN/" | base64 -w0)\"" cloud-init-sops-secret.yaml
