<template>
  <el-menu
      background-color="#336699"
      text-color="#FFFFFF"
      active-text-color="#ffd04b"
      style="height: 100vh;"
      default-active="/Home"
      :collapse-transition="false"
      :collapse="isCollapse"
      router
  >
    <el-menu-item index="/Home">
      <i class="el-icon-s-home"></i>
      <span slot="title">首页</span>
    </el-menu-item>

    <el-menu-item :index="'/'+item.menuclick" v-for="(item,i) in menu" :key="i">
      <i :class="item.menuicon"></i>
      <span slot="title">{{item.menuname}}</span>
    </el-menu-item>


  </el-menu>
</template>

<script>
export default {
  name: "Aside",
  data() {
    return {
      //isCollapse: false
      // menu:[
      //   {
      //     menuClick:'Main',
      //     menuName:'用户管理',
      //     menuIcon:'el-icon-s-custom'
      //   },{
      //     menuClick:'User',
      //     menuName:'药品管理',
      //     menuIcon:'el-icon-user-solid'
      //   }]
    }

  },
  computed:{
    "menu":{
      get(){
        return this.$store.state.menu
      }
    }
  },
  props:{
    isCollapse:Boolean
  }
}
</script>

<style scoped>

</style>