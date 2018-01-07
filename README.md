# Node.js Tikkie API

JavaScript implementation of the [Tikkie API](https://developer.abnamro.com/content/tikkie).

## Installation
```bash
yarn add tikkie
```

## Usage
```javascript
import {TikkieClient, TikkieConfig} from 'tikkie';

const config = new TikkieConfig('apiKey');
config.loadPrivateKey('path_to_key', 'RS256');

const tikkie = new TikkieClient(config);

```
