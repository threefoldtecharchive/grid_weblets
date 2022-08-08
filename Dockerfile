# choose the Image which has Node installed already
FROM node:14 AS build

# make the 'app' folder the current working directory
WORKDIR /app

# copies package.json to cache the np latter on
COPY package.json .

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# install project dependencies
RUN yarn deps

# increase the max memory for node
RUN echo "export NODE_OPTIONS=\"--max-old-space-size=8192\"" >> ~/.bashrc

# build project solutions
RUN yarn run build

# install nginx
FROM nginx:1.19-alpine

# serve the build files using nginx
COPY --from=build /app/.build /usr/share/nginx/html
