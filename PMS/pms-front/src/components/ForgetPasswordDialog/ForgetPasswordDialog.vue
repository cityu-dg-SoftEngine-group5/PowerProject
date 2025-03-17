<template>
  <el-dialog title="Get your password" :visible.sync="visible" width="30%">
    <el-form>
      <el-form-item label="Email">
        <el-input v-model="email" placeholder="Please enter your registered email" />
      </el-form-item>

      <el-form-item label="Captcha">
        <div class="captcha-area">
          <el-input v-model="captcha" style="width: 60%"/>
          <el-button
              :disabled="countdown > 0"
              @click="sendCode"
          >
            {{ countdown ? `${countdown}s resending` : 'Get captcha' }}
          </el-button>
        </div>
      </el-form-item>
    </el-form>

    <span slot="footer">
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" @click="handleSubmit">Submit</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  props: {
    visible: Boolean
  },
  data() {
    return {
      email: '',
      captcha: '',
      countdown: 0
    }
  },
  methods: {
    sendCode() {
      // set time gap into resend captcha
      this.countdown = 60
      const timer = setInterval(() => {
        if (this.countdown <= 0) clearInterval(timer)
        else this.countdown--
      }, 1000)
    },
    handleSubmit() {
      this.$emit('update:visible', false)
    }
  }
}
</script>