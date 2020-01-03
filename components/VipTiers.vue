<template>
  <section class="swell-vip-tier-list-container">
    <table class="swell-vip-tier-table">
      <slot name="thead" :vip-tiers-full-list="vipTiersFullList" :customer-vip-tier-id="customerVipTierId">
        <thead>
          <tr>
            <th :data-index="0">{{ $t('Benefits') }}</th>
            <th :data-index="index + 1" v-show="showCol === (index + 1) || showCol === null" v-for="(vipTier, index) in vipTiersFullList" :key="vipTier.id" :class="{'customer-tier': withStatus && vipTier.id === customerVipTierId}">
              <h5>{{ vipTier.name }}</h5>
              <p>{{ vipTier.description }}</p>
            </th>
          </tr>
        </thead>
      </slot>
      <slot name="tbody" :rows="rows" :vip-tiers-full-list="vipTiersFullList" :customer-vip-tier-id="customerVipTierId">
        <tbody>
          <tr v-for="(row, index) in rows" :key="index">
            <td :data-index="0">{{ row.name }}</td>
            <td v-show="showCol === (i + 1) || showCol === null" :data-index="i + 1" v-for="(vipTier, i) in vipTiersFullList" :key="vipTier.id" v-html="row.htmlValue(vipTier)" />
          </tr>
        </tbody>
      </slot>
      <slot name="tfoot" :vip-tiers-full-list="vipTiersFullList" :customer-vip-tier-id="customerVipTierId" />
    </table>
  </section>
</template>

<script>
import { mapState } from 'vuex'
import i18n from '@vue-storefront/i18n'
import { KEY } from '../index'

export default {
  name: 'VipTiers',
  props: {
    withStatus: {
      type: Boolean,
      required: false,
      default: false
    },
    notVipTier: {
      type: Object,
      required: false,
      default: function () {
        return {
          id: -1,
          name: i18n.t('Good Giver'),
          description: i18n.t('Create an account'),
          points_multiplier: 1
        }
      }
    },
    rows: {
      type: Array,
      required: false,
      default: function () {
        return [
          {
            name: i18n.t('Point multiplier'),
            htmlValue: (row) => parseFloat(row.points_multiplier) + 'x'
          }
        ]
      }
    },
    showCol: {
      type: Number,
      required: false,
      default: null
    }
  },
  data () {
    return {
    }
  },
  computed: {
    ...mapState(KEY, ['customer', 'vipTiers']),
    vipTiersFullList () {
      return [
        this.notVipTier,
        ...this.vipTiers
      ]
    },
    customerVipTierId () {
      return this.customer && this.customer.vip_tier_name ? this.customer.vip_tier_name : -1
    }
  },
  serverPrefetch () {
    return this.fetchVipTiers()
  },
  mounted () {
    if (!this.vipTiers.length) {
      this.fetchVipTiers()
    }
  },
  methods: {
    fetchVipTiers () {
      return this.$store.dispatch(KEY + '/fetchVipTiers')
    }
  }
}
</script>
