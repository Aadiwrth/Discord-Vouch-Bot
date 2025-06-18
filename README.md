# Vouch discord bot

## Function

- Added a `/vouch`
- Added a `/restore`
- Added a `/vouches`

## Description

Add the `/vouch [rating (1-5)] [msg] option:[proof]` to your discord server

![Image](https://cdn.discordapp.com/attachments/1292387872418172978/1384897134201012234/image.png?ex=68541976&is=6852c7f6&hm=18298cd9d4f9dc2abc2bd3bb176e3240322a83bb033a6ae304f294528f1e7fcf&)

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)

## Installation

```sh
npm i

(if you are using it on vps then use `Screen -S [name]`
```

Make sure to full the config.json with the following

```sh
{
    "bot": {
        "token": "your bot token",
        "clientId": "your bot clientId",
        "owners": ["your admin role"]
    },
    "guild": {
        "id": "server ID",
        "embedColour": "your embed color in hex"

    },
  "channels": {
    "vouch": "your vouch channel"
  },
  "emojis": {
    "star": "your rating emoji",
    "react": "your emoji which will react to your message"
  }
}
```

## Usage
```sh
node .
```

/vouch [rating (1-5)] [msg] option:[proof]

## Common issues

### Unknown Integration

This error occurs when a command has been added, updated or modified and your server does not handle it properly.
To fix this simply kick your bot and invite it again. 

## Contact

- GitHub: [newQuery](https://github.com/Aadiwrth)
