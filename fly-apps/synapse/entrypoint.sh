#!/bin/sh

set -uex

eval $(/db_env.py)

sed -i \
    -e "s/__REGSECRET__/$REGISTRATION_SECRET/" \
    -e "s/__SIGNINGKEY__/$SIGNING_KEY/" \
    -e "s/__DBUSER__/$PGUSER/" \
    -e "s/__DBPASS__/$PGPASSWORD/" \
    -e "s/__DBHOST__/$PGHOST/" \
    -e "s/__DBPORT__/$PGPORT/" \
    -e "s/__DBNAME__/$PGDATABASE/" \
    /config/homeserver.yaml

cat /config/homeserver.yaml

/start.py
