FROM node:22-alpine as builder
WORKDIR /builder
COPY . .
RUN npm i
RUN npm run web-production

FROM nginx:alpine

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /builder/dist .
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]