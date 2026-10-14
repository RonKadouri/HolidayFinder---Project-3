# Install Linux containing MySQL 8.4 (the long-term support version):
FROM mysql:8.4

# Docker runs the scripts in this folder only once - on the first run, while the database is still empty:
COPY holiday_finder.sql /docker-entrypoint-initdb.d/
