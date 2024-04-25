FROM postgres:16-alpine

ONBUILD RUN psql -U test-sain -d test-sain -c "create extension unaccent;"
