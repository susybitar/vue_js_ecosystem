# ETAPA 1: Compilación
# Usamos Node.js para transformar el código Vue en archivos estáticos
FROM node:lts-alpine as build-stage

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos las librerías necesarias
RUN npm install

# Copiamos el resto del código y generamos el build
COPY . .
RUN npm run build

# ETAPA 2: Producción
# Usamos Nginx para servir la web de forma eficiente
FROM nginx:stable-alpine as production-stage

# Copiamos el resultado del build a la carpeta de Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Informamos que el contenedor usa el puerto 80
EXPOSE 80

# Ejecutamos Nginx
CMD ["nginx", "-g", "daemon off;"]