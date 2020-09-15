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

Add settings from `local.json` to your config file.

## Swell Rewards API extension

Install additional extension for `vue-storefront-api`: [vsf-api-swell-rewards](https://github.com/AbsoluteWebServices/vsf-api-swell-rewards).

