<template>
  <form @submit.prevent="identify" class="swell-identify-referrer">
    <slot name="field" :email="email">
      <input v-model="email" type="email" :placeholder="$t('Your email')">
    </slot>
    <slot name="button">
      <button type="submit">
        {{ $t('Apply') }}
      </button>
    </slot>
  </form>
</template>

<script>
import { mapState } from 'vuex'
import { required, email } from 'vuelidate/lib/validators'
import i18n from '@vue-storefront/i18n'
import { KEY } from '../index'
import * as types from '../store/mutation-types'

export default {
  name: 'IdentifyReferrer',
  data () {
    return {
      email: null
    }
  },
  methods: {
    async identify () {
      this.$v.$touch()

      if (this.$v.$invalid) {
        this.$store.dispatch('notification/spawnNotification', {
          type: 'error',
          message: i18n.t('Please enter valid email'),
          action1: { label: i18n.t('OK') }
        })
      }

      await this.$store.dispatch(KEY + '/getCustomerV1', this.email)
    }
  },
  validations: {
    email: {
      required,
      email
    }
  }
}
</script>
