<template>
  <el-container style="height: 800px; border: 1px solid #eee">
    <el-aside :width="aside_width" style="background-color: rgb(238, 241, 246)">
      <Aside :isCollapse="isCollapse"></Aside>
    </el-aside>

    <el-container>
      <el-header style="text-align: right; font-size: 12px;border-bottom: darkgray 1px solid">
        <Header @doCollapse="doCollapse" :icon="icon"></Header>
      </el-header>

      <el-main>
<!--        <Main></Main>-->
        <router-view></router-view>

      </el-main>
    </el-container>
  </el-container>
</template>

<script>
    import Aside from "./Aside"
    import Header from "./Header";


    export default {
      name: "Index",
      components: {Header, Aside},
      data(){
        return {
          isCollapse: false,
          aside_width: '200px',
          icon:'el-icon-s-fold'
        }
      },
      methods:{
        doCollapse(){
          console.log("doCollapse")
          this.isCollapse =!this.isCollapse
          if (!this.isCollapse){//展开
            this.aside_width='200px'
            this.icon='el-icon-s-fold'
          }else{//关起
            this.aside_width='64px'
            this.icon='el-icon-s-unfold'
          }
        }
      }





    }
</script>

<style scoped>

    .el-header {
      #background-color: #B3C0D1;
      color: #333;
      line-height: 60px;
    }
    .el-main{
      padding: 5px;
    }
    .el-aside {
      color: #333;
    }
</style>