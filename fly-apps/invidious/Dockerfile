FROM quay.io/invidious/invidious:latest

COPY entrypoint.sh /
COPY invidious.yaml /invidious/config/config.yaml

ENV INVIDIOUS_CONFIG_FILE=/invidious/config/config.yaml

ENTRYPOINT /entrypoint.sh
