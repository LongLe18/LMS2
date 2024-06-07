FROM node:12-alpine

WORKDIR /app

# Expose the port 3000
EXPOSE 3000

# Set the default command to run when a container starts
CMD ["npm", "start"]
# Install app dependencies
COPY package.json /app
RUN npm install
# Copy your code in the docker image
COPY . /app
