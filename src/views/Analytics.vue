<template>
  <div class="container">
    <h1>This is an orderBook analytics page</h1>

<!--    <pre>{{ atTheHelm }}</pre>-->

    <div>
      <b-jumbotron>
        <div>
          <b-button-toolbar key-nav aria-label="Start/stop parsing data">
            <b-button-group class="mx-1">
              <b-button @click="startSync">Start</b-button>
              <b-button :class="{ disabled: !started }" @click="stopSync">Stop</b-button>
            </b-button-group>
          </b-button-toolbar>
        </div>
      </b-jumbotron>
    </div>

    <div>
      <b-card-group deck>
        <b-card
            header="Total sell size"
            header-tag="header"
        >
          <b-card-text><h2>{{ totalSellSize }} <b-badge v-if="atTheHelm === 'bears'">{{ advantages }}%</b-badge></h2></b-card-text>
        </b-card>

        <b-card
            header="Total buy size"
            header-tag="header"
        >
          <b-card-text><h2>{{ totalBuySize }} <b-badge v-if="atTheHelm === 'bulls'">{{ advantages }}%</b-badge></h2></b-card-text>
        </b-card>

      </b-card-group>
    </div>

    <div class="container">
      <div class="row">
        <div class="col-sm">
          <b-table size="xs" striped hover :items="orderBook.sell" :fields="fields"></b-table>
        </div>

        <div class="col-sm">
          <b-table size="xs" striped hover :items="orderBook.buy" :fields="fields"></b-table>
        </div>
      </div>
    </div>

  </div>
</template>

<script>

  import _ from 'lodash';

  export default {

    data () {
      return {
        socketUrl: 'wss://www.bitmex.com/realtime',
        orderBook: {
          sell: [],
          buy: [],
        },
        socket: {},
        started: false,
        fields: [
          {
            key: 'id',
            class: 'minified',
          },
          {
            key: 'side',
            class: 'minified',
          },
          {
            key: 'size',
            sortable: true,
          },
          {
            key: 'price',
            sortable: true,
          },
        ],
        totalSellSize: 0,
        totalBuySize: 0,
        atTheHelm: 'bulls',
      }
    },

    watch: {
      'orderBook.sell': {
        handler(val){
          this.totalSellSize = _.sumBy(val, 'size');
        },
        deep: true
      },

      'orderBook.buy': {
        handler(val){
          this.totalBuySize = _.sumBy(val, 'size');
        },
        deep: true
      }
    },

    computed: {
      advantages: function () {
        let result = {};
        if (this.totalBuySize > this.totalSellSize) {
          this.atTheHelm = 'bulls';
          return _.round((this.totalBuySize / this.totalSellSize) * 100 - 100, 2)
        } else {
          this.atTheHelm = 'bears';
          return _.round((this.totalSellSize / this.totalBuySize) * 100 - 100, 2)
        }
      }
    },

    methods: {

      stopSync() {
        if (!this.started) return;
        this.socket.close();
        this.started = false;
      },

      startSync() {
        this.started = true;
        this.initSocket();
      },

      initSocket() {
        this.socket = new WebSocket(this.socketUrl);
        this.socket.onopen = () => {
          const subscription = `{"op": "subscribe", "args": ["orderBookL2_25:XBTUSD"]}`;
          this.socket.send(subscription);
        };

        let self = this;
        this.socket.onmessage = function(event) {
          let response = JSON.parse(event.data);
          if (response.action === 'partial') {

            _.map(response.data, order => {
              if( order.side === 'Sell' ) {

                self.orderBook.sell.push(order);

              } else if (order.side === 'Buy') {

                self.orderBook.buy.push(order);

              }
            });

          } else if (response.action === 'update') {
            const dataForUpdate = response.data;

            _.map(dataForUpdate, item => {
              self.update(item);
            });
          }
        };
      },

      update(newItem) {

        if (newItem.side === 'Sell') {

          let localItem = _.find(this.orderBook.sell, ['id', newItem.id]);
          _.merge(localItem, newItem);

        } else {
          let localItem = _.find(this.orderBook.buy, ['id', newItem.id]);
          _.merge(localItem, newItem);
        }

      },

    }
  }
</script>

<style lang="sass">
  td
    padding: 0 !important
    font-size: 0.6rem
    &.minified
      font-size: 0.5em
      width: 30px
</style>

