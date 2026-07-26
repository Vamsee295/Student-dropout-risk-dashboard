FROM nginx:1.25-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf.template /etc/nginx/conf.d/default.conf

# To use envsubst in the future if we need dynamic variables in nginx conf
# RUN apk add --no-cache gettext

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
