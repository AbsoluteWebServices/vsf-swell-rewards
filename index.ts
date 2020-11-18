import { StorefrontModule } from '@vue-storefront/core/lib/modules'
import { module } from './store'
import { afterRegistration } from './hooks/afterRegistration'

export const KEY = 'swell-rewards'

export const SwellRewards: StorefrontModule = function ({ store, appConfig }) {
  store.registerModule(KEY, module)

  afterRegistration(appConfig, store)
}
