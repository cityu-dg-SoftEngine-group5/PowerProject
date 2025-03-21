<template>
  <el-container style="height: 100vh; border: 1px solid #eee">
    <el-header style="height:120px; text-align: left; font-size: 12px;margin: 0;
  padding: 0;">
      <Header @doCollapse="doCollapse" :icon="icon"></Header>
    </el-header>

    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
import Header from "./Header.vue";


export default {
  name: "Index",
  components: {Header},
  data() {
    return {
      isCollapse: false,
      aside_width: '200px',
      icon: 'el-icon-setting'
    }
  },
  methods: {
    doCollapse() {
      console.log("doCollapse")
      this.isCollapse = !this.isCollapse
      if (!this.isCollapse) {//展开
        this.aside_width = '200px'
        this.icon = 'el-icon-s-fold'
      } else {//关起
        this.aside_width = '64px'
        this.icon = 'el-icon-s-unfold'
      }
    }
  }
}
</script>

<style scoped>

.el-header {
  color: #333;
  line-height: 60px;
}

.el-main {
  padding: 5px;
}

.el-aside {
  color: #333;
}
</style>