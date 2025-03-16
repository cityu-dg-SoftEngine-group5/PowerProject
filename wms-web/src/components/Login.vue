<template>
    <div class="loginBody">
      <div class="login-header">
<!--        <img src="../assets/pictures/logo1.png" alt="学院Logo" >-->
        <h1>pms</h1>
      </div>


        <div  class="loginDiv" >
            <div  class="login-content">
                <h1 class="login-title">用户登录</h1>
                <el-form :model="loginForm" label-width="100px"
                         :rules="rules" ref="loginForm">
                    <el-form-item label="账号" prop="no">
                        <el-input style="width: 200px" type="text" v-model="loginForm.no"
                                  autocomplete="off" size="small"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input style="width: 200px" type="password" v-model="loginForm.password"
                                  show-password autocomplete="off" size="small" @keyup.enter.native="confirm"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="clear" :disabled="confirm_disabled">重 置</el-button>
                        <el-button type="primary" @click="confirm" :disabled="confirm_disabled">确 定</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>

    </div>
</template>


<script>
    export default {
        name: "Login",
        data(){
            return{
                confirm_disabled:false,
                loginForm:{
                    no:'',
                    password:''
                },
                rules:{
                    no: [
                        { required: true, message: '请输入账号', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '请输密码', trigger: 'blur' }
                    ],
                },
                // background:{
                //   background: {
                //     // 背景图片地址
                //     backgroundImage: 'url(' + require('../assets/pictures/background.png') + ')',
                //     // 背景图片是否重复
                //     backgroundRepeat: 'no-repeat',
                //     // 背景图片大小
                //     backgroundSize: 'cover',
                //     // 背景颜色
                //     backgroundColor: '#000',
                //     // 背景图片位置
                //     backgroundPosition: 'center top'
                //   }
                // }
            }
        },
        methods:{

            confirm(){
                this.confirm_disabled=true;
                this.$refs.loginForm.validate((valid) => {
                    if (valid) { //valid成功为true，失败为false
                        //去后台验证用户名密码
                        this.$axios.post(this.$httpUrl+'/user/login',this.loginForm).then(res=>res.data).then(res=>{
                            console.log(res)
                            if(res.code==200){
                                //存储
                                sessionStorage.setItem("CurUser",JSON.stringify(res.data.user))

                                console.log(res.data.menu)
                                this.$store.commit("setMenu",res.data.menu)
                                //跳转到主页
                                this.$router.replace('/Index');
                            }else{
                                this.confirm_disabled=false;
                                alert('校验失败，用户名或密码错误！');
                                return false;
                            }
                        });
                    } else {
                        this.confirm_disabled=false;
                        console.log('校验失败');
                        return false;
                    }
                });

            },
            clear(){
                this.loginForm.no='';
                this.loginForm.password='';
            }
        }
    }
</script>

<style scoped>
    .loginBody {
        position: absolute;
        width: 100%;
        height: 100%;
        /*background-color: #B3C0D1;*/
      /*background: url("../assets/pictures/WechatIMG835.jpg") center center no-repeat;*/
      /*background-size: 100% 100%;*/
    }
    .loginDiv {
        position: absolute;
        top: 50%;
        left: 50%;
        margin-top: -200px;
        margin-left: -250px;
        width: 450px;
        height: 330px;
        background: #fff;
        border-radius: 5%;
      opacity: 0.95;



    }
    .login-title {
        margin: 20px 0;
        text-align: center;
    }
    .login-content {
        width: 400px;
        height: 250px;
        position: absolute;
        top: 25px;
        left: 25px;
    }

    .login-header {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 30px;
      background-color: darkgray;
    }

    .login-header img {
      max-width: 400px;
      height: auto;
      margin-right: 10px;
    }

    .login-header h1 {
      font-family: Arial, sans-serif;
      font-size: 40px;
      font-weight: normal;
      color: black;
      margin: 0;
    }
</style>