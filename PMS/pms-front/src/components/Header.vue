<template>
  <div class="header">
    <el-row :gutter="20" type="flex" justify="left">
      <el-col :span="2" class="center">
        <div>
          <el-button :class="icon" style="margin-left: 5px; margin-right: 5px"></el-button>
        </div>
<!--        <div>-->
<!--          <i :class="icon" style="font-size: 20px;cursor: pointer;" @click="collapse"></i>-->
<!--        </div>-->
      </el-col>
      <el-col :span="6" >
        <el-button type="text" class="title"  style="color: black; font-size: 14px">Project Management System</el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-menu
          mode="horizontal"
          :default-active="activeIndex"
          class="el-menu"
          background-color="rgb(246,248,250)"
          @select="handleSelect"
      >
        <el-menu-item index="/kanban">
          <i class="el-icon-folder"></i>
          Kanban
        </el-menu-item>
        <el-menu-item index="/code">
          <i class="el-icon-folder"></i>
          Code
        </el-menu-item>
        <el-menu-item index="/chat">
          <i class="el-icon-folder"></i>
          Chat
        </el-menu-item>
      </el-menu>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "Header",
  data(){
    return {
      // user : JSON.parse(sessionStorage.getItem('CurUser'))
      activeIndex: "code",
      user: {lab: 110}
    }
  },
  props:{
    icon:String
  },
  methods:{
    toUser(){
      console.log('to_user')

      this.$router.push("/Home")
    },
    logout(){
      console.log('logout')

      this.$confirm('您确定要退出登录吗?', '提示', {
        confirmButtonText: '确定',  //确认按钮的文字显示
        type: 'warning',
        center: true, //文字居中显示

      })
          .then(() => {
            this.$message({
              type:'success',
              message:'退出登录成功'
            })

            this.$router.push("/")
            sessionStorage.clear()
          })
          .catch(() => {
            this.$message({
              type:'info',
              message:'已取消退出登录'
            })
          })

    },
    collapse(){
      this.$emit('doCollapse')
    },
    handleSelect(key, keyPath) {
      this.$router.push(key)
      // console.log(key, keyPath)
    }

  },
  created(){
    this.$router.push("/Home")
  }

}
</script>

<style scoped>
.header {
  background-color: rgb(246,248,250);
}

.title {
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";
  font-size: 14px;
  font-weight: 600;
  color: rgb(31, 35, 40);
}
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>