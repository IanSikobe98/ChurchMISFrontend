# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:16.20.2-alpine as build-stage

WORKDIR /app
COPY package.json /app/
COPY package-lock.json /app/

COPY dist/ /app/build/

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.15
EXPOSE 8080
COPY --from=build-stage /app/build/ /usr/share/nginx/html
COPY ./etc/nginx.conf /etc/nginx/conf.d/default.conf

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
