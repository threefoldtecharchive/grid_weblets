# Choose the Image which has Node installed already
FROM node:14 AS build


# make the 'app' folder the current working directory
WORKDIR /app


# copies package.json to cache the np latter on
COPY package.json .


# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .


# install project dependencies
RUN yarn deps

RUN echo "export NODE_OPTIONS=\"--max-old-space-size=8192\"" >> ~/.bashrc

RUN yarn serve:app

