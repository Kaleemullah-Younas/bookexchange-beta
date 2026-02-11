FROM node:22-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Copy all source files
COPY . .

RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Build the application
ENV NODE_ENV=production
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
