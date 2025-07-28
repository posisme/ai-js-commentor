# ai-js-commentor README

This is the first run at an AI tool to get comments for javascript

# Docker and Docker Compose files to use for development
## Dockerfile
```
FROM ubuntu:latest

ENV TZ=America/Chicago

RUN apt update -y
RUN	apt install nodejs -y
RUN	apt install sudo -y
RUN	apt install rsync -y
RUN	apt install sqlite3 -y
RUN	apt install git -y
RUN apt install npm -y
RUN npm install --global yo generator-code
RUN npm install -g @vscode/vsce


RUN adduser randy
RUN chown randy:randy /home/randy/
RUN sudo usermod -a -G sudo randy
	

STOPSIGNAL SIGWINCH
WORKDIR /home/randy
CMD ["tail", "-f", "/dev/null"]
```
## docker-compose.yml
```
services:
  app:
    build: .
    environment:
      TZ: America/Chicago
    volumes:
      - ./app:/home/randy  # Mount your application directory to the container
    restart: always
```
