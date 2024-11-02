# Use Node.js image for building the frontend
FROM node:20

WORKDIR /app
COPY package*.json ./

# Install dependencies and build Next.js app
RUN npm install
# fix issues if any
RUN npm audit fix  

COPY . .

# Install typescript
RUN npm install -g typescript

# Run the build script to build the service
RUN npm run build

EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "run", "start"]
