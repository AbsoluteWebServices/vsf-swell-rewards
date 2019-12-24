# Vue Storefront Swell Rewards Extension

The Swell Rewards integration module for [vue-storefront](https://github.com/DivanteLtd/vue-storefront).

## Installation

By hand (preferer):

```shell
git clone git@github.com:AbsoluteWebServices/vsf-swell-rewards.git ./vue-storefront/src/modules/
```

Registration the Swell Rewards module. Go to `./vue-storefront/src/modules/index.ts`

```js
...
import { SwellRewards } from './vsf-swell-rewards';

export const registerModules: VueStorefrontModule[] = [
  ...
  SwellRewards
]
```

Add following settings to your config file.

```json
  "swellRewards": {
    "endpoint": "http://localhost:8080/api/ext/swell-rewards"
  },
```

## Swell Rewards API extension

Install additional extension for `vue-storefront-api`:

```shell
cp -f ./vue-storefront/src/modules/vsf-swell-rewards/API/swell-rewards ./vue-storefront-api/src/api/extensions/
```

Add the config to your api config.

```json
  "extensions":{
    "swellRewards": {
      "guid": "__YOUR_GUID__",
      "apiKey": "__YOUR_API_KEY__",
      "apiUrl": "https://app.swellrewards.com/api/v2"
    },
    ...
  },
  "registeredExtensions": [
    "swell-rewards",
    ...
  ],
```
