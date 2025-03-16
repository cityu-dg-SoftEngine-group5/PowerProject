<template>
  <div id="app">
     <router-view/>
  </div>
</template>

<script>

// import Index from "./components/Index"

export default {
  name: 'App',
  components: {},
  data(){
    return{
      user: JSON.parse(sessionStorage.getItem('CurUser'))
    }
  },
  watch: {
    '$store.state.menu':{
      handler(val,old){
        console.log(val,old);
        if (!old && this.user && this.user.no){
          this.$store.commit("setRouter",val)
        }
      },
      immediate:true
    },
  }
}
</script>

<style>
#app {
  /*font-family: Avenir, Helvetica, Arial, sans-serif;*/
  /*-webkit-font-smoothing: antialiased;*/
  /*-moz-osx-font-smoothing: grayscale;*/
  /*text-align: center;*/
  /*color: #2c3e50;*/
  height: 100%;
  
}
</style>
