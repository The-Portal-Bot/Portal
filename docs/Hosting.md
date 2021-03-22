[< back to README](https://github.com/keybraker/portal-discord-bot#regex-interpreter)

## Self Hosting

### Prerequisites

#### macOS

1.  install [homebrew](https://brew.sh)

        $ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

2.  update homebrew

        $ brew update

3.  install npm and node ^14.x

        $ brew install node@14

#### ubuntu

1.  install npm ^6.x

        $ sudo curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash –

2.  install nodejs ^14.x

        $ sudo apt install nodejs

> make sure you have version ^14.x or higher with `node -v`

### Build

1.  Open a terminal windows and clone Portal

        $ git clone https://github.com/keybraker/portal.git && cd portal

2.  Install node packages

        $ npm install

### Configure

> Go to `Portal/src/config.json` and add the APIs you want. Note that if you do not want some, go to `Portal/src/config.command.json` and delete the command corelating to the missing api (ex. covid_193 -> corona)

   ```json
   {
     "version": "0.6.6", // current version
     "token": "add-your-token-here", // your Discord-API-Token
     "prefix": "./", // default prefix
     "mongo_url": "mongodb://mongo/portal?compressors=zlib&gssapiServiceName=portal", // mongoDB url
     "owner_id": "add-your-id-(optional)", // owner ID maybe used throughout Portal
     "api_keys": { // Api keys for Portal services
       "OpenWeatherMap": "add-open-weather-map-api-key",
       "covid_193": "add-covid-193-api-key",
       "coingecko": "add-coingecko-api-key",
       "football_data": "add-football-data-api-key",
       "yahoo_finance": "add-yahoo-finance-api-key",
       "new_york_times": "add-new-york-time-api-key",
       "translate": {
         "engine": "yandex",
         "key": "add-yeandex-api-key"
       }
     },
     "delete_msg": false, // wheather or not Portal will delete messages
     "delete_msg_after": 5, // how long after message sent, will it be deleted
     "always_reply": true, // wheather or not Portal will reply to messages
     "debug": false, // display run time information in console
     "log": false // log files in ../logs directory on host
   }
   ```

> Keep in mind that mongo_url by default is set to link to docker container, in case you are running it as a standalone app, you shall give the url of the mongo database

### Run

#### In case you want to run Portal with terminal (ex. tmux)

1.  Go to Portal directory

        $ cd Portal

2.  Build Portal

        $ npm run build

3.  Run Portal

        $ npm run start

#### In case you want to run Portal with docker

1.  Go to Portal directory

        $ cd Portal

2.  Create Portal image and download mongo image

        $ docker-compose build

3.  Check if everything went well

        $ docker images

        REPOSITORY   TAG       IMAGE ID       CREATED          SIZE
        portal       latest    4cfb856dc61d   2 minutes ago   1.27GB
        node         14        e2885a998904   5 minutes ago    943MB
        mongo        4.4.3     ca8e14b1fda6   4 minutes ago    493MB


4.  Run Portal

        $ docker-compose up


5.  To stop Portal

        $ docker-compose down

In case you want to run Portal as a standalone docker container

    	$ docker build . -f docker/Dockerfile -t portal
    	$ docker images
    	REPOSITORY   TAG       IMAGE ID       CREATED          SIZE
    	portal       latest    4cfb856dc61d   15 minutes ago   1.27GB
    	$ docker run portal
    	$ docker stop 4cfb856dc61d
