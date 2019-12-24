<template>
  <section class="swell-campaign-list-container">
    <slot name="title" />
    <ul class="swell-campaign-list">
      <li v-for="campaign in campaigns" :key="campaign.id">
        <slot :campaign="campaign">
          <div>
            <i :class="campaign.icon" />
            <h5>{{ campaign.title }}</h5>
            <p>{{ campaign.reward_text }}</p>
          </div>
        </slot>
      </li>
    </ul>
  </section>
</template>

<script>
import { mapState } from 'vuex'
import { KEY } from '../index'

export default {
  name: 'Campaigns',
  props: {
    withStatus: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    ...mapState(KEY, ['campaigns'])
  },
  serverPrefetch () {
    return this.fetchCampaigns()
  },
  mounted () {
    if (!this.item) {
      this.fetchCampaigns()
    }
  },
  methods: {
    fetchCampaigns () {
      return this.$store.dispatch(KEY + '/getActiveCampaigns', this.withStatus)
    }
  }
}
</script>
