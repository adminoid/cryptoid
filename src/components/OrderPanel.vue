<template>
  <div>
    <b-button @click="makeLimitOrder">Make limit order</b-button>
  </div>
</template>

<script>

  export default {
    name: "OrderPanel",

    data () {
      return {
        apiKey: 'W2Z3rYqP95dtnmAQ6YAQKHIY',
        apiSecret: 'Bh7Z_SLNBVkvez8ZH-fRRnWVUeui8X9X4D8NqPPGJ7DC7Jyo',
      }
    },

    methods: {
      makeLimitOrder () {
        console.info('makeLimitOrder');
      },

    }
  }
</script>

<style scoped>

</style>
