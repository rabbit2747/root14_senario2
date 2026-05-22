FROM python:3.12-alpine

RUN apk add --no-cache bash openldap-clients
WORKDIR /app
COPY seed.sh seed_files.py seed_wiki.py seed_ops_state.py ./
RUN chmod +x /app/seed.sh
ENTRYPOINT ["/app/seed.sh"]
