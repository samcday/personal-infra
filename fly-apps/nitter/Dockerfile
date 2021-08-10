FROM ghcr.io/samcday/nitter:96621e9b5417bb8a32189d2edb8dcfa74bc2f228
RUN apk add python3
COPY entrypoint.sh /entrypoint.sh
COPY redis_env.py /redis_env.py
COPY nitter.conf /src/nitter.conf
ENTRYPOINT /entrypoint.sh
