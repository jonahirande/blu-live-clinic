# Use the official MongoDB image
FROM mongo:latest

# Environment variables for initial setup
ENV MONGO_INITDB_ROOT_USERNAME=admin
ENV MONGO_INITDB_ROOT_PASSWORD=p@ssw0rd
ENV MONGO_INITDB_DATABASE=liveclinic

# OpenShift/Docker will automatically execute any .js files in this folder on startup
COPY init-db.js /docker-entrypoint-initdb.d/

# Expose the standard MongoDB port
EXPOSE 27017