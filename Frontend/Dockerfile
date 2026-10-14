# Install Linux Alpine containing Node.js 24
FROM node:24-alpine

# Create project folder inside the image:
WORKDIR /app

# Copy only package.json and package-lock.json files to /app inside the image:
COPY package*.json /app

# Run npm install inside the image to build node_modules
RUN npm install

# Copy current app to /app inside the image:
COPY . /app

# ----------------------------------------------------------

ENTRYPOINT [ "npm", "start" ]
