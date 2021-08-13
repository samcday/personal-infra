FROM matrixdotorg/synapse:v1.40.0

COPY db_env.py entrypoint.sh /
COPY homeserver.yaml log.yaml /config/

ENV SYNAPSE_CONFIG_PATH /config/homeserver.yaml

ENTRYPOINT ["/entrypoint.sh"]
