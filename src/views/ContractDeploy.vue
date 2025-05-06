<template>
  <div class="contract-deploy-container">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="ERC20代币" name="erc20">
        <div class="tab-content">
          <h2>部署ERC20代币合约</h2>
          <p class="description">输入代币基本信息，部署新的ERC20代币合约</p>
          
          <el-form :model="erc20Form" label-width="120px" class="form-container">
            <el-form-item label="代币名称">
              <el-input v-model="erc20Form.name" placeholder="输入代币名称" />
            </el-form-item>
            <el-form-item label="代币符号">
              <el-input v-model="erc20Form.symbol" placeholder="输入代币符号" />
            </el-form-item>
            <el-form-item label="代币精度">
              <el-input-number v-model="erc20Form.decimals" :min="0" :max="18" :step="1" />
            </el-form-item>
            <el-form-item label="初始供应量">
              <el-input-number v-model="erc20Form.totalSupply" :min="0" :step="1" :precision="0" />
            </el-form-item>
            <el-form-item label="代币特性">
              <div class="switch-group">
                <el-switch
                  v-model="erc20Form.mintable"
                  active-text="可增发"
                  inactive-text="不可增发"
                />
                <el-switch
                  v-model="erc20Form.burnable"
                  active-text="可销毁"
                  inactive-text="不可销毁"
                />
                <el-switch
                  v-model="erc20Form.pausable"
                  active-text="可暂停"
                  inactive-text="不可暂停"
                />
              </div>
            </el-form-item>

            <!-- 部署结果展示区域 -->
            <div v-if="deployResult.address || deployResult.error" class="deploy-result">
              <div v-if="deployResult.address" class="success-result">
                <p>合约部署成功！</p>
                <el-input
                  v-model="deployResult.address"
                  readonly
                  class="contract-address"
                >
                  <template #append>
                    <el-button @click="copyAddress">复制</el-button>
                  </template>
                </el-input>
              </div>
              <div v-if="deployResult.error" class="error-result">
                <p>部署失败：</p>
                <el-alert
                  :title="deployResult.error"
                  type="error"
                  :closable="false"
                  show-icon
                />
              </div>
            </div>

            <el-form-item>
              <el-button type="primary" @click="handleDeploy" :loading="loading" size="large">
                部署合约
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ethers } from 'ethers'
import { ElMessage } from 'element-plus'
import erc20ABI from '../config/StandErc20_ABI.json'

declare global {
  interface Window {
    ethereum?: any
  }
}

const activeTab = ref('erc20')
const loading = ref(false)

// 部署结果
const deployResult = ref({
  address: '',
  error: ''
})

// ERC20合约部署表单
const erc20Form = ref({
  name: '',
  symbol: '',
  decimals: 18,
  totalSupply: 0,
  mintable: false,
  burnable: false,
  pausable: false
})

// 复制地址到剪贴板
const copyAddress = async () => {
  try {
    await navigator.clipboard.writeText(deployResult.value.address)
    ElMessage.success('地址已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 部署合约
const handleDeploy = async () => {
  if (!erc20Form.value.name || !erc20Form.value.symbol) {
    ElMessage.warning('请填写完整信息')
    return
  }

  loading.value = true
  deployResult.value = { address: '', error: '' } // 重置部署结果

  try {
    // 检查是否安装了MetaMask
    if (typeof window.ethereum === 'undefined') {
      deployResult.value.error = '请先安装MetaMask钱包'
      return
    }

    const erc20Bytecode = await fetch('/src/config/StandErc20_Byte.dat')
      .then(res => res.text())
      .then(text => {
        // Remove all whitespace, newlines, and make sure it's a clean hex string
        const cleaned = text.replace(/\s+/g, '').trim();
        console.log('Original bytecode length:', text.length);
        console.log('Cleaned bytecode length:', cleaned.length);
        return cleaned;
      });
    
    // 请求用户连接钱包
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    if (!accounts || accounts.length === 0) {
      deployResult.value.error = '请先连接钱包'
      return
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()

    // 准备合约构造函数参数
    const totalSupplyBigNumber = ethers.utils.parseUnits(
      erc20Form.value.totalSupply.toString(), 
      erc20Form.value.decimals
    );
    
    // Create constructor args as an array to prevent any spreading issues
    const constructorArgs = [
      erc20Form.value.name,
      erc20Form.value.symbol,
      totalSupplyBigNumber
    ];
    
    console.log('Constructor arguments:', {
      name: erc20Form.value.name,
      symbol: erc20Form.value.symbol,
      totalSupply: totalSupplyBigNumber.toString()
    });

    // 创建合约工厂
    const factory = new ethers.ContractFactory(
      erc20ABI,
      erc20Bytecode,
      signer
    )

    // 部署合约
    ElMessage.info('正在部署合约，请在钱包中确认交易...')
    // Deploy with explicit argument passing to prevent spreading issues in WebContainer
    const contract = await factory.deploy(
      constructorArgs[0],
      constructorArgs[1],
      constructorArgs[2]
    );
    
    // 等待合约部署完成
    await contract.deployed()

    deployResult.value.address = contract.address
    ElMessage.success('合约部署成功!')
  } catch (error) {
    console.error('合约部署失败:', error)
    deployResult.value.error = (error as Error).message
    ElMessage.error('合约部署失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.contract-deploy-container {
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

h2 {
  margin-top: 0;
  color: #303133;
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 16px;
}

.switch-group {
  display: flex;
  gap: 20px;
  align-items: center;
}

.deploy-result {
  margin: 20px 0;
  padding: 16px;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.success-result {
  margin-bottom: 16px;
}

.success-result p {
  color: #67c23a;
  margin-bottom: 8px;
  font-weight: 500;
}

.contract-address {
  width: 100%;
}

.error-result p {
  color: #f56c6c;
  margin-bottom: 8px;
  font-weight: 500;
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
  flex-direction: column;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
  margin-top: auto;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-button--primary) {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

:deep(.el-switch) {
  margin-right: 20px;
}

:deep(.el-switch__label) {
  color: #606266;
}

:deep(.el-switch__label.is-active) {
  color: #409EFF;
}
</style> 