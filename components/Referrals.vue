<template>
  <section class="swell-referrals-list-container">
    <table>
      <thead>
        <tr>
          <slot name="head">
            <th>
              {{ $t('Email') }}
            </th>
            <th>
              {{ $t('Status') }}
            </th>
          </slot>
        </tr>
      </thead>
      <tbody>
        <tr v-for="referral in referrals" :key="referral.id">
          <slot name="row" :referral="referral">
            <td>
              {{ referral.email }}
            </td>
            <td>
              {{ referral.completed_at ? $t('Completed') : (referral.signed_up_at ? $t('Signed up') : $t('Invited')) }}
            </td>
          </slot>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script>
import { mapState } from 'vuex'
import { KEY } from '../index'
import * as types from '../store/mutation-types'

export default {
  name: 'Referrals',
  computed: {
    ...mapState(KEY, ['customer']),
    referrals () {
      return this.$store.getters[KEY + '/getCustomerReferrals']
    }
  }
}
</script>
