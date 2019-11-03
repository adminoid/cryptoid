<template>
  <div class="container">
    <h1>OrderBook analytics</h1>
    <div class="wrapper">
      <b-jumbotron>

        <div class="container">
          <div class="row">
            <div class="col-sm">
              <b-button-toolbar key-nav aria-label="Start/stop parsing data">
                <b-button-group class="mx-1">
                  <b-button @click="startSync">Start</b-button>
                  <b-button :class="{ disabled: !started }" @click="stopSync">Stop</b-button>
                </b-button-group>
              </b-button-toolbar>
            </div>

            <div class="col-sm">

              <b-form inline>
                <label for="qty">
                  Qty
                </label>
                <b-input
                    v-model="qty"
                    id="qty"
                    class="mb-1 mr-sm-1 mb-sm-0"
                    placeholder="qty"
                ></b-input>

                <label for="risk-level">
                  Risk
                </label>
                <b-input
                    v-model="risk"
                    id="risk-level"
                    class="mb-1 mr-sm-1 mb-sm-0"
                    placeholder="risk"
                ></b-input>
              </b-form>

            </div>
          </div>
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
          <b-table striped hover :items="orderBook.sell" :fields="fields">
            <template v-slot:cell(size)="data">
              {{ data.item.size }} <b-badge>{{ data.item.percent }}</b-badge>
            </template>
            <template v-slot:cell(order)="data">
              <a href="#" @click.prevent="makeOrder(data.item.side, data.item.price)"> [-] </a>
            </template>
          </b-table>
        </div>

        <div class="col-sm">
          <b-table striped hover :items="orderBook.buy" :fields="fields">
            <template v-slot:cell(size)="data">
              {{ data.item.size }} <b-badge>{{ data.item.percent }}</b-badge>
            </template>
            <template v-slot:cell(order)="data">
              <a href="#" @click.prevent="makeOrder(data.item.side, data.item.price)"> [+] </a>
            </template>
          </b-table>
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
        risk: 5,
        qty: 2,
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
            class: 'test-' + 3,
          },
          {
            key: 'price',
            sortable: true,
          },
          {
            key: 'order',
          },
        ],
        totalSellSize: 0,
        totalBuySize: 0,
        atTheHelm: 'bulls',
        price: {
          sell: 0,
          buy: 0,
        }
      }
    },

    watch: {
      'orderBook.sell': {
        handler(val){
          this.totalSellSize = _.sumBy(val, 'size');
          let sells = _.sortBy(_.clone(this.orderBook.sell), 'size');
          let maxSizeItems = sells.slice(Math.max(sells.length - 5, 1));
          _.map(this.orderBook.sell, item => {
            delete item.percent;
            delete item._rowVariant;
          });
          let sellSizeAverage = _.meanBy(this.orderBook.sell, (item) => item.size);
          _.map(maxSizeItems, item => {
            item.percent = this.advantage(sellSizeAverage, item.size) + '%';
            item._rowVariant = 'danger';
          });
          this.price.sell = _.pick(_.maxBy(this.orderBook.sell, 'price'), 'price');
        },
        deep: true
      },

      'orderBook.buy': {
        handler(val){
          this.totalBuySize = _.sumBy(val, 'size');
          let buys = _.sortBy(_.clone(this.orderBook.buy), 'size');
          let maxSizeItems = buys.slice(Math.max(buys.length - 5, 1));
          _.map(this.orderBook.buy, item => {
            delete item.percent;
            delete item._rowVariant;
          });

          let buySizeAverage = _.meanBy(this.orderBook.buy, (item) => item.size);
          _.map(maxSizeItems, item => {
            item.percent = this.advantage(buySizeAverage, item.size) + '%';
            item._rowVariant = 'danger';
          });
          this.price.buy = _.pick(_.maxBy(this.orderBook.buy, 'price'), 'price');
        },
        deep: true
      }
    },

    computed: {
      advantages: function () {
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

      makeOrder(side, price) {
        console.log(side, price);
        console.log(this.risk, this.qty);
      },

      advantage(avg, big) {
        return _.round((big / avg) * 100 - 100)
      },

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
          } else if (response.action === 'delete') {

            const dataForRemove = response.data;

            _.map(dataForRemove, item => {
              if (item.side === 'Sell') {
                _.remove(self.orderBook.sell, itemOrig => {
                  return itemOrig.id === item.id;
                });
              } else {
                _.remove(self.orderBook.buy, itemOrig => {
                  return itemOrig.id === item.id;
                });
              }
            });

          } else if (response.action === 'insert') {

            const dataForInsert = response.data;
            _.map(dataForInsert, item => {
              if (item.side === 'Sell') {
                self.orderBook.sell.push(item);
              } else {
                self.orderBook.buy.push(item);
              }
            });

          } else {
            console.info(response);
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
  .wrapper
    position: relative
    padding-top: 0
    .jumbotron
      padding: 1em
  .badge
    background: #ff5c52
    position: relative
    top: -3px
  table
    .badge
      font-weight: bold
      font-size: 1em
  #risk-level,#qty
    width: 50px
    margin-left: 5px

</style>

