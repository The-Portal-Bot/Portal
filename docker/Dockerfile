#latest might break unexpectedly 
FROM node:17

# Create app directory
RUN mkdir -p /usr/src/portal
WORKDIR /usr/src/portal

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
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