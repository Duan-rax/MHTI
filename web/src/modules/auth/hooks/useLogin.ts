import { ref, reactive, onMounted, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, type FormRules } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import type { ExpireOption } from '@/modules/auth/api'

export interface LoginFormData {
  username: string
  password: string
  expire_option: ExpireOption
}

export interface RegisterFormData {
  username: string
  password: string
  confirmPassword: string
}

/**
 * LoginFormPanel 经 defineExpose 上抛的表单能力
 *
 * 提交前由本 hook 调用 validate()；空转缺陷修复后校验真正生效。
 */
export interface LoginFormExposed {
  validate: () => Promise<void> | undefined
}

export function useLogin(formRef: Ref<LoginFormExposed | null> = ref<LoginFormExposed | null>(null)) {
  const router = useRouter()
  const message = useMessage()
  const authStore = useAuthStore()

  const loading = ref(false)
  const checking = ref(true)
  const isRegisterMode = ref(false)

  const loginForm = reactive<LoginFormData>({
    username: '',
    password: '',
    expire_option: '7d',
  })

  const registerForm = reactive<RegisterFormData>({
    username: '',
    password: '',
    confirmPassword: '',
  })

  const loginRules: FormRules = {
    username: { required: true, message: '请输入用户名', trigger: 'blur' },
    password: { required: true, message: '请输入密码', trigger: 'blur' },
  }

  const registerRules: FormRules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 32, message: '用户名长度 3-32 个字符', trigger: 'blur' },
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 128, message: '密码长度至少 6 个字符', trigger: 'blur' },
    ],
    confirmPassword: [
      { required: true, message: '请确认密码', trigger: 'blur' },
      {
        validator: (_rule: any, value: string) => value === registerForm.password,
        message: '两次输入的密码不一致',
        trigger: 'blur',
      },
    ],
  }

  onMounted(async () => {
    checking.value = true
    const initialized = await authStore.checkInitialized()
    isRegisterMode.value = !initialized
    checking.value = false
  })

  async function handleLogin() {
    try {
      await formRef.value?.validate()
    } catch {
      return
    }

    loading.value = true
    try {
      await authStore.login(
        loginForm.username,
        loginForm.password,
        loginForm.expire_option
      )
      message.success('登录成功')
      router.push('/')
    } catch (error: any) {
      const detail = error.response?.data?.detail || '登录失败'
      message.error(detail)
    } finally {
      loading.value = false
    }
  }

  async function handleRegister() {
    try {
      await formRef.value?.validate()
    } catch {
      return
    }

    loading.value = true
    try {
      await authStore.register({
        username: registerForm.username,
        password: registerForm.password,
      })
      message.success('注册成功，已自动登录')
      router.push('/')
    } catch (error: any) {
      const detail = error.response?.data?.detail || '注册失败'
      message.error(detail)
    } finally {
      loading.value = false
    }
  }

  return {
    loginForm,
    registerForm,
    loginRules,
    registerRules,
    loading,
    checking,
    isRegisterMode,
    handleLogin,
    handleRegister,
  }
}
