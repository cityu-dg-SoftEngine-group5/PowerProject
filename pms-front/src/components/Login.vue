<template>
  <div class="login-container">
    <el-card class="login-box">
      <div class="logo-area">
        <img src="@/assets/logo.png" alt="CodeCollab" class="logo">
        <h1 class="title">Project Management System</h1>
      </div>

      <el-form
          ref="loginForm"
          :model="form"
          :rules="rules"
          @submit.native.prevent="handleLogin"
      >
        <!-- username input -->
        <el-form-item prop="username">
          <el-input
              v-model="form.username"
              prefix-icon="el-icon-user"
              placeholder="Please enter your username"
              clearable
          />
        </el-form-item>

        <!-- password input -->
        <el-form-item prop="password">
          <el-input
              v-model="form.password"
              prefix-icon="el-icon-lock"
              placeholder="Please enter your password"
              show-password
              clearable
          />
        </el-form-item>

        <!-- captcha -->
        <el-form-item prop="captcha">
          <div class="captcha-wrapper">
            <el-input
                v-model="form.captcha"
                prefix-icon="el-icon-picture"
                placeholder="Captcha"
                style="width: 60%"
            />
            <img
                :src="captchaUrl"
                class="captcha-img"
                @click="refreshCaptcha"
            >
          </div>
        </el-form-item>

        <div class="login-options">
          <el-checkbox v-model="rememberMe">Remember</el-checkbox>
          <el-link type="primary" @click="showForgetDialog">Forget password?</el-link>
        </div>

        <el-form-item>
          <el-button
              type="primary"
              native-type="submit"
              :loading="loading"
              class="login-btn"
          >
            {{ loading ? 'Waiting...' : 'Login' }}
          </el-button>
        </el-form-item>

        <!-- 注册提示 -->
        <div class="register-tip">
          No account? <el-link type="primary" @click="goRegister">Register</el-link>
        </div>
      </el-form>
    </el-card>

    <forget-password-dialog :visible.sync="showForget" />
  </div>
</template>

<script>
// import { encrypt } from '@/utils/crypto'
import ForgetPasswordDialog from './ForgetPasswordDialog/ForgetPasswordDialog.vue'

export default {
  components: { ForgetPasswordDialog },
  data() {
    return {
      form: {
        username: '',
        password: '',
        captcha: ''
      },
      rules: {
        username: [
          { required: true, message: 'Username cannot be empty', trigger: 'blur' },
          { min: 4, max: 16, message: 'The length is between 4 and 16 characters.', trigger: 'blur' }
        ],
        password: [
          { required: true, message: 'Password cannot be empty', trigger: 'blur' },
          { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,16}$/,
            message: 'It must contain uppercase and lowercase letters and numbers, 8-16 characters' }
        ],
        captcha: [
          { required: true, message: 'Verification code cannot be empty', trigger: 'blur' },
          { len: 4, message: 'The verification code is 4 characters', trigger: 'blur' }
        ]
      },
      rememberMe: false,
      loading: false,
      captchaUrl: require("@/assets/pictures/captcha_test.png"),
      // captchaUrl: '/api/captcha?t=' + Date.now(),
      showForget: false
    }
  },
  methods: {
    // 刷新验证码
    refreshCaptcha() {
      // this.captchaUrl = `/api/captcha?t=${Date.now()}`
    },

    // 处理登录提交
    async handleLogin() {
      try {
        await this.$refs.loginForm.validate()
        this.loading = true

        const params = {
          ...this.form,
          // password: encrypt(this.form.password)
          password: this.form.password
        }

        await this.$store.dispatch('user/login', params)

        const redirect = this.$route.query.redirect || '/'
        this.$router.push(redirect)

      } catch (error) {
        if (error !== 'validate') {
          this.refreshCaptcha()
          this.$message.error(error.message || '登录失败')
        }
      } finally {
        this.loading = false
      }
    },

    showForgetDialog() {
      this.showForget = true
    },

    goRegister() {
      this.$router.push('/register')
    }
  }
}
</script>
<!--background: url('~@/assets/login-bg.jpg') no-repeat center/cover;-->
<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;


  .login-box {
    width: 420px;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);

    .logo-area {
      text-align: center;
      margin-bottom: 30px;

      .logo {
        width: 80px;
        height: 80px;
        margin-bottom: 15px;
      }

      .title {
        font-size: 20px;
        color: #303133;
      }
    }

    .captcha-wrapper {
      display: flex;
      justify-content: space-between;

      .captcha-img {
        width: 35%;
        height: 40px;
        cursor: pointer;
        border-radius: 4px;
      }
    }

    .login-options {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .login-btn {
      width: 100%;
      letter-spacing: 2px;
    }

    .register-tip {
      text-align: center;
      color: #606266;
      margin-top: 15px;
    }
  }
}

@media (max-width: 768px) {
  .login-box {
    width: 90% !important;
    margin: 0 auto;
  }
}
</style>