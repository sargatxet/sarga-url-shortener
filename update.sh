#!/bin/bash

docker compose down
docker image rm sarga-url-shortener-url_shortener:latest
git pull
docker compose up -d && docker compose logs -f