#!/bin/bash
set -e

#Configure pg_hba.conf for trust authentication
echo "Configuring PostgreSQL authentication..."
cat > /var/lib/postgresql/data/pg_hba.conf <<EOF
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             all                                     trust

# IPv4 local connections
host    all             all             127.0.0.1/32            trust
host    all             all             0.0.0.0/0               md5

# IPv6 local connections
host    all             all             ::1/128                 trust
EOF

# Reload configuration
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT pg_reload_conf();
EOSQL

echo "PostgreSQL authentication configured successfully"
