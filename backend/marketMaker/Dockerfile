# Use the official Node.js 14 as a parent image
FROM node:20

# Setup the working directory in the container
WORKDIR /mm

# Copy the package.json and package.lock.json files to the working directory
COPY package*.json ./

# Install any dependencies
RUN npm install
# fix issues if any
RUN npm audit fix  

# Copy all the files now to the working directory
COPY . .

# Install typescript
RUN npm install -g typescript

# Run the build script to build the service
RUN npm run build

# Define the command to run your api service using CMD which defines your runtime
CMD ["node", "dist/index.js"]