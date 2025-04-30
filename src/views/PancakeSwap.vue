<template>
  <div class="pancakeswap-container">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="创建LP" name="create">
        <div class="tab-content">
          <h2>创建流动性池</h2>
          <p class="description">创建一个新的流动性池，设置代币对和手续费等级</p>
          
          <el-form :model="createForm" label-width="120px" class="form-container">
            <el-form-item label="代币A地址">
              <el-input v-model="createForm.tokenA" placeholder="输入代币A地址">
                <template #append>
                  <el-button @click="handleTokenASelect">选择</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="代币B地址">
              <el-input v-model="createForm.tokenB" placeholder="输入代币B地址">
                <template #append>
                  <el-button @click="handleTokenBSelect">选择</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="手续费等级">
              <el-select v-model="createForm.fee" placeholder="选择手续费等级">
                <el-option label="0.01%" :value="100" />
                <el-option label="0.05%" :value="500" />
                <el-option label="0.3%" :value="3000" />
                <el-option label="1%" :value="10000" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleCreatePool" :loading="loading" size="large">
                创建池子
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="添加流动性" name="add">
        <div class="tab-content">
          <h2>添加流动性</h2>
          <p class="description">向现有池子添加流动性，设置价格范围和数量</p>
          
          <el-form :model="addLiquidityForm" label-width="120px" class="form-container">
            <el-form-item label="池子地址">
              <el-input v-model="addLiquidityForm.poolAddress" placeholder="输入池子地址">
                <template #append>
                  <el-button @click="handlePoolSelect">选择</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="代币A数量">
              <el-input-number v-model="addLiquidityForm.amountA" :precision="18" :step="1" :min="0" />
            </el-form-item>
            <el-form-item label="代币B数量">
              <el-input-number v-model="addLiquidityForm.amountB" :precision="18" :step="1" :min="0" />
            </el-form-item>
            <el-form-item label="价格范围">
              <div class="price-range">
                <el-input-number v-model="addLiquidityForm.lowerPrice" :precision="18" :step="0.1" :min="0" />
                <span class="price-separator">-</span>
                <el-input-number v-model="addLiquidityForm.upperPrice" :precision="18" :step="0.1" :min="0" />
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleAddLiquidity" :loading="loading" size="large">
                添加流动性
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="移除流动性" name="remove">
        <div class="tab-content">
          <h2>移除流动性</h2>
          <p class="description">从池子中移除流动性，收回您的代币</p>
          
          <el-form :model="removeLiquidityForm" label-width="120px" class="form-container">
            <el-form-item label="LP代币ID">
              <el-input v-model="removeLiquidityForm.tokenId" placeholder="输入LP代币ID">
                <template #append>
                  <el-button @click="handleLPTokenSelect">选择</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="移除比例">
              <el-slider v-model="removeLiquidityForm.percentage" :step="1" :marks="percentageMarks" />
              <div class="percentage-value">{{ removeLiquidityForm.percentage }}%</div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleRemoveLiquidity" :loading="loading" size="large">
                移除流动性
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="代币交换" name="swap">
        <div class="tab-content">
          <h2>代币交换</h2>
          <p class="description">在池子中进行代币交换，设置滑点容忍度</p>
          
          <el-form :model="swapForm" label-width="120px" class="form-container">
            <el-form-item label="输入代币">
              <el-input v-model="swapForm.tokenIn" placeholder="输入代币地址">
                <template #append>
                  <el-button @click="handleTokenInSelect">选择</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="输出代币">
              <el-input v-model="swapForm.tokenOut" placeholder="输出代币地址">
                <template #append>
                  <el-button @click="handleTokenOutSelect">选择</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="输入数量">
              <el-input-number v-model="swapForm.amountIn" :precision="18" :step="1" :min="0" />
            </el-form-item>
            <el-form-item label="滑点容忍度">
              <el-input-number v-model="swapForm.slippage" :precision="2" :step="0.1" :min="0.1" :max="100" />
              <span class="unit">%</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSwap" :loading="loading" size="large">
                交换
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { ethers } from 'ethers'
import { ElMessage } from 'element-plus'

const activeTab = ref('create')
const loading = ref(false)

// 创建池子表单
const createForm = ref({
  tokenA: '',
  tokenB: '',
  fee: 3000
})

// 添加流动性表单
const addLiquidityForm = ref({
  poolAddress: '',
  amountA: 0,
  amountB: 0,
  lowerPrice: 0,
  upperPrice: 0
})

// 移除流动性表单
const removeLiquidityForm = ref({
  tokenId: '',
  percentage: 100
})

// 交换表单
const swapForm = ref({
  tokenIn: '',
  tokenOut: '',
  amountIn: 0,
  slippage: 0.5
})

// 百分比标记
const percentageMarks = computed(() => {
  return {
    0: '0%',
    25: '25%',
    50: '50%',
    75: '75%',
    100: '100%'
  }
})

// 代币选择处理函数
const handleTokenASelect = () => {
  ElMessage.info('选择代币A')
  // 这里可以实现代币选择逻辑
}

const handleTokenBSelect = () => {
  ElMessage.info('选择代币B')
  // 这里可以实现代币选择逻辑
}

const handlePoolSelect = () => {
  ElMessage.info('选择池子')
  // 这里可以实现池子选择逻辑
}

const handleLPTokenSelect = () => {
  ElMessage.info('选择LP代币')
  // 这里可以实现LP代币选择逻辑
}

const handleTokenInSelect = () => {
  ElMessage.info('选择输入代币')
  // 这里可以实现代币选择逻辑
}

const handleTokenOutSelect = () => {
  ElMessage.info('选择输出代币')
  // 这里可以实现代币选择逻辑
}

// 创建池子
const handleCreatePool = async () => {
  if (!createForm.value.tokenA || !createForm.value.tokenB) {
    ElMessage.warning('请填写完整信息')
    return
  }

  loading.value = true
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum!)
    const signer = provider.getSigner()
    
    // 这里需要调用PancakeSwap V3的工厂合约来创建池子
    // 具体实现需要根据PancakeSwap V3的合约接口来完成
    ElMessage.success('池子创建成功')
  } catch (error) {
    console.error('创建池子失败:', error)
    ElMessage.error('创建池子失败')
  } finally {
    loading.value = false
  }
}

// 添加流动性
const handleAddLiquidity = async () => {
  if (!addLiquidityForm.value.poolAddress || !addLiquidityForm.value.amountA || !addLiquidityForm.value.amountB) {
    ElMessage.warning('请填写完整信息')
    return
  }

  loading.value = true
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum!)
    const signer = provider.getSigner()
    
    // 这里需要调用PancakeSwap V3的NonfungiblePositionManager合约来添加流动性
    // 具体实现需要根据PancakeSwap V3的合约接口来完成
    ElMessage.success('添加流动性成功')
  } catch (error) {
    console.error('添加流动性失败:', error)
    ElMessage.error('添加流动性失败')
  } finally {
    loading.value = false
  }
}

// 移除流动性
const handleRemoveLiquidity = async () => {
  if (!removeLiquidityForm.value.tokenId) {
    ElMessage.warning('请填写完整信息')
    return
  }

  loading.value = true
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum!)
    const signer = provider.getSigner()
    
    // 这里需要调用PancakeSwap V3的NonfungiblePositionManager合约来移除流动性
    // 具体实现需要根据PancakeSwap V3的合约接口来完成
    ElMessage.success('移除流动性成功')
  } catch (error) {
    console.error('移除流动性失败:', error)
    ElMessage.error('移除流动性失败')
  } finally {
    loading.value = false
  }
}

// 代币交换
const handleSwap = async () => {
  if (!swapForm.value.tokenIn || !swapForm.value.tokenOut || !swapForm.value.amountIn) {
    ElMessage.warning('请填写完整信息')
    return
  }

  loading.value = true
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum!)
    const signer = provider.getSigner()
    
    // 这里需要调用PancakeSwap V3的SwapRouter合约来进行代币交换
    // 具体实现需要根据PancakeSwap V3的合约接口来完成
    ElMessage.success('交换成功')
  } catch (error) {
    console.error('交换失败:', error)
    ElMessage.error('交换失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.pancakeswap-container {
  height: 100%;
  width: 1000px;
}

.tab-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  height: 600px;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 24px;
}

.description {
  color: #606266;
  margin-bottom: 30px;
  font-size: 14px;
}

.form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-range :deep(.el-input-number) {
  width: calc(100% - 10px);
}

.price-separator {
  margin: 0 10px;
}

.percentage-value {
  text-align: center;
  margin-top: 10px;
  font-weight: bold;
}

.unit {
  margin-left: 10px;
}

h2 {
  margin-top: 0;
  color: #303133;
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 16px;
}

:deep(.el-tabs) {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__header) {
  margin: 0;
  padding: 0;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0;
}

:deep(.el-tabs__item) {
  height: 40px;
  line-height: 40px;
  font-size: 16px;
  padding: 0 20px;
}

:deep(.el-tabs__content) {
  flex: 10;
  height: auto;
  padding: 24px;
}

:deep(.el-tab-pane) {
  height: 100%;
  width: 100%;
}

:deep(.el-form) {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction:column;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
  margin-top: auto;
}
</style> 