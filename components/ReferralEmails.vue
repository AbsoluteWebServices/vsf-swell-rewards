<template>
  <form @submit.prevent="sendEmails" class="swell-referral-emails">
    <slot name="field" :emails="emails" :set-emails="val => emails = val">
      <input v-model="emails" type="text" :placeholder="$t(`Your friends' emails (separated by commas)`)">
    </slot>
    <slot name="button">
      <button type="submit">
        {{ $t('Send') }}
      </button>
    </slot>
  </form>
</template>

<script>
import { mapState } from 'vuex'
import i18n from '@vue-storefront/i18n'
import { KEY } from '../index'

export default {
  name: 'ReferralEmails',
  data () {
    return {
      emailsVal: []
    }
  },
  computed: {
    emails: {
      get: function () {
        return this.emailsVal.join(',')
      },
      set: function (newValue) {
        this.emailsVal = newValue.trim().split(',')
      }
    }
  },
  methods: {
    async sendEmails (e) {
      await this.$store.dispatch(KEY + '/sendReferralEmails', this.emails)
    }
  }
}
</script>
