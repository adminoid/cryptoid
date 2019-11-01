<template>
  <div class="container">
    <h1>This is an orderBook analytics page</h1>

    <div class="btn-group">
      <button class="btn btn-primary" @click="startSync">Start</button>
      <button class="btn btn-danger" :class="{ disabled: !started }" @click="stopSync">Stop</button>
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
    &.minified
      font-size: 0.5em
      width: 30px
</style>

