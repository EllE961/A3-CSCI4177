FROM node:18

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all project files
COPY . .

# Expose gateway and admin ports
EXPOSE 8080 9876

# Start the gateway
CMD ["npm", "start"]
