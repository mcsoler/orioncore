#!/bin/sh
# Lo ejecuta la imagen de Nginx al arrancar (/docker-entrypoint.d/).
# Recarga Nginx cada 6 h para que tome los certificados que renueva certbot.
(while :; do sleep 21600; nginx -s reload; done) &
