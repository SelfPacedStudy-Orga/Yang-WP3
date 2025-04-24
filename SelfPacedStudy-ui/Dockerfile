# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Copy the .env file
COPY .env .env

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

CMD ["npm", "run", "start"]
#CMD ["npm", "run", "dev"]

