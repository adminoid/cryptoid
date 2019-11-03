<template>
  <div class="wrapper">
    {{ price }}
    <svg ref="chart" :width="width" :height="height"></svg>
  </div>
</template>

<script>

  import * as d3 from 'd3';

  export default {
    name: 'candle',

    props: ['price'],

    data: () => ({
      width: 100,
      height: 10,
    }),

    mounted() {
      let chartSvg = d3.select(this.$refs.chart);
      console.log(chartSvg);
    }

  }
</script>

<style lang="sass">
  .wrapper
    padding-top: 50px
</style>
