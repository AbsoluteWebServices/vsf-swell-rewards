import { StorefrontModule } from '@vue-storefront/core/lib/modules'
import { afterRegistration } from './hooks/afterRegistration'
import { module } from './store'

export const KEY = 'swell-rewards'

export const SwellRewards: StorefrontModule = function ({ store, appConfig }) {
  store.registerModule(KEY, module)
}
