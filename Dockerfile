# Etapa 1: Instalación y Construcción
FROM node:20-alpine AS build-stage
WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos las librerías necesarias
RUN npm install

# Copiamos el resto del código y generamos el build
COPY . .
RUN npm run build

# Etapa 2: Servidor de Producción (Nginx)
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Configuramos Nginx para que haga de puente (Igual que Vite)
RUN echo 'server { \
    listen 80; \
    location / { \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    try_files $uri $uri/ /index.html; \
    } \
    location /api/deezer/ { \
    proxy_pass https://api.deezer.com/; \
    proxy_ssl_server_name on; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]