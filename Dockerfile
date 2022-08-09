# choose the Image which has Node installed already
FROM node:16 AS build

# add arg for the network
ARG NETWORK

RUN echo ${NETWORK}

# make the 'app' folder the current working directory
WORKDIR /app

# copy package.json to cache the np latter on
COPY package.json .

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# increase the max memory for node
ENV NODE_OPTIONS="--max-old-space-size=4096"

# install project dependencies
RUN yarn deps

# build project solutions
RUN yarn build:app

# install nginx
FROM nginx:1.19-alpine

# serve the build files using nginx
COPY --from=build /app/dist /usr/share/nginx/html

WORKDIR /usr/share/nginx/html
RUN apk add --no-cache bash


CMD ["nginx", "-g", "daemon off;"]