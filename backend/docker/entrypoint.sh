#!/bin/sh
set -eu
composer install --no-interaction --prefer-dist --no-scripts
mkdir -p var /var/lib/jwt
php bin/console lexik:jwt:generate-keypair --skip-if-exists --no-interaction
php bin/console cache:clear
if [ "${APP_ENV:-prod}" = "dev" ]; then
    php bin/console app:seed --no-interaction
fi
chown -R www-data:www-data var /var/lib/jwt
chmod 640 /var/lib/jwt/private.pem
printf 'ok\n' > /var/www/healthz.txt
exec docker-php-entrypoint "$@"
