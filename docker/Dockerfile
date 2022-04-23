FROM node:17

# Create app directory
RUN mkdir -p /usr/src/portal
# Make app working directory
WORKDIR /usr/src/portal

COPY package*.json ./
COPY tsconfig*.json ./

# If you are building your code for production
# RUN npm ci --only=production else RUN npm install
RUN npm ci --only=production
RUN npm install typescript --save-dev

# Bundle app source
COPY . .

RUN npm run build
CMD [ "node", "build/index.js" ]