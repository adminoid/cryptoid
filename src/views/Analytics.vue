<template>
  <div class="about">
    <h1>This is an orderBook analytics page</h1>

    <b-table striped hover :items="orderBook"></b-table>

  </div>
</template>

<script>

  import _ from 'lodash';

  export default {

    data () {
      return {
        socketUrl: 'wss://www.bitmex.com/realtime',
        orderBook: [],
        socket: {},
      }
    },

    created() {
      this.initSocket();
    },

    mounted() {

      // setTimeout(() => {
      //   this.socket.close();
      // }, 7000);

    },

    methods: {

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
            self.initOrderBook(response.data);
          } else if (response.action === 'update') {
            const dataForUpdate = response.data;

            _.map(dataForUpdate, item => {
              self.update(item);
            });
          }
        };
      },

      update(newItem) {
        let localItem = _.find(this.orderBook, ['id', newItem.id]);
        _.merge(localItem, newItem);
      },

      initOrderBook (data) {

        this.orderBook = data;

      },

    }
  }
</script>
