[< back to README](https://github.com/keybraker/portal-discord-bot#regex-interpreter)

## Self Hosting

### Prerequisites

#### macOS

1. install [homebrew](https://brew.sh)

       $ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

2. update homebrew

       $ brew update

3. install npm and node ^14.x

       $ brew install node@14

#### ubuntu

1. install npm ^6.x

       $ sudo curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash –

2. install nodejs ^14.x

       $ sudo apt install nodejs

> make sure you have version ^14.x or higher with `node -v`

### Build

1. Open a terminal windows and clone Portal

       $ git clone https://github.com/keybraker/portal.git && cd portal

2. Install node packages

       $ npm install

### Configure

1. Create a bot on Discord Portal and add the toke in config.json

    ```json
    {
      "token": "add-your-token-here",
      "prefix": "./",
      "database_json": "src/database/guild_list.json",
      "owner_id": "add-your-id-(optional)",
      "portal_id": "add-bots-id-(optional)",
      "api_keys": {
        "OpenWeatherMap": "add-open-weather-map-api-key",
        "covid_193": "add-covid-193-api-key",
        "translate": {
          "engine": "yandex",
          "key": "add-yeandex-api-key"
        }
      },
      "delete_msg": false,
      "delete_msg_after": 5,
      "always_reply": true
    }
    ```

### Run

#### In case you want to run Portal with terminal (ex. tmux)

1. Compile Portal

       $ npm run compile
        
2. Run Portal

       $ npm start
        
#### In case you want to run Portal with docker

1. Create Portal docker image

       $ docker build . -f docker/Dockerfile -t portal
        
2. Check if everything went well

       $ docker images

       REPOSITORY   TAG       IMAGE ID       CREATED          SIZE
       portal       latest    4cfb856dc61d   15 minutes ago   1.27GB
        
3. Run docker image

       $ docker run portal
        
4. Run docker image (4cfb856dc61d is id from `docker images`)

       $ docker stop 4cfb856dc61d