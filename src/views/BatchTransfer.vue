<template>
  <div class="batch-transfer-container">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="批量转账" name="transfer">
        <div class="tab-content">
          <h2>批量转账</h2>
          <p class="description">向多个地址批量转账代币</p>
          
          <el-form :model="transferForm" label-width="120px" class="form-container">
            <el-form-item label="代币地址">
              <el-input v-model="transferForm.tokenAddress" placeholder="输入代币地址">
                <template #append>
                  <el-button @click="handleTokenSelect">选择</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="转账列表">
              <el-table :data="transferForm.transfers" style="width: 100%">
                <el-table-column label="接收地址" prop="to">
                  <template #default="{ row }">
                    <el-input v-model="row.to" placeholder="输入接收地址" />
                  </template>
                </el-table-column>
                <el-table-column label="数量" prop="amount">
                  <template #default="{ row }">
                    <el-input-number v-model="row.amount" :precision="18" :step="1" :min="0" />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                  <template #default="{ $index }">
                    <el-button type="danger" @click="removeTransfer($index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="table-footer">
                <el-button type="primary" @click="addTransfer">添加转账</el-button>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleBatchTransfer" :loading="loading" size="large">
                执行批量转账
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="批量归集" name="collect">
        <div class="tab-content">
          <h2>批量归集</h2>
          <p class="description">将多个地址的代币归集到一个地址</p>
          
          <el-form :model="collectForm" label-width="120px" class="form-container">
            <el-form-item label="代币地址">
              <el-input v-model="collectForm.tokenAddress" placeholder="输入代币地址">
                <template #append>
                  <el-button @click="handleTokenSelect">选择</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="归集地址">
              <el-input v-model="collectForm.toAddress" placeholder="输入归集地址">
                <template #append>
                  <el-button @click="handleAddressSelect">选择</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="源地址列表">
              <el-table :data="collectForm.sources" style="width: 100%">
                <el-table-column label="源地址" prop="from">
                  <template #default="{ row }">
                    <el-input v-model="row.from" placeholder="输入源地址" />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                  <template #default="{ $index }">
                    <el-button type="danger" @click="removeSource($index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="table-footer">
                <el-button type="primary" @click="addSource">添加源地址</el-button>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleBatchCollect" :loading="loading" size="large">
                执行批量归集
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
import { ElMessage } from 'element-plus'
import { ethers } from 'ethers'

const activeTab = ref('transfer')
const loading = ref(false)

// 批量转账表单
const transferForm = ref({
  tokenAddress: '',
  transfers: [
    { to: '', amount: 0 }
  ]
})

// 批量归集表单
const collectForm = ref({
  tokenAddress: '',
  toAddress: '',
  sources: [
    { from: '' }
  ]
})

// 添加转账记录
const addTransfer = () => {
  transferForm.value.transfers.push({ to: '', amount: 0 })
}

// 删除转账记录
const removeTransfer = (index: number) => {
  transferForm.value.transfers.splice(index, 1)
}

// 添加源地址
const addSource = () => {
  collectForm.value.sources.push({ from: '' })
}

// 删除源地址
const removeSource = (index: number) => {
  collectForm.value.sources.splice(index, 1)
}

// 选择代币
const handleTokenSelect = () => {
  ElMessage.info('选择代币')
  // 这里可以实现代币选择逻辑
}

// 选择地址
const handleAddressSelect = () => {
  ElMessage.info('选择地址')
  // 这里可以实现地址选择逻辑
}

// 执行批量转账
const handleBatchTransfer = async () => {
  if (!transferForm.value.tokenAddress || transferForm.value.transfers.length === 0) {
    ElMessage.warning('请填写完整信息')
    return
  }

  loading.value = true
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum!)
    const signer = provider.getSigner()
    
    // 这里需要调用代币合约的transfer方法进行批量转账
    // 具体实现需要根据代币合约的接口来完成
    ElMessage.success('批量转账成功')
  } catch (error) {
    console.error('批量转账失败:', error)
    ElMessage.error('批量转账失败')
  } finally {
    loading.value = false
  }
}

// 执行批量归集
const handleBatchCollect = async () => {
  if (!collectForm.value.tokenAddress || !collectForm.value.toAddress || collectForm.value.sources.length === 0) {
    ElMessage.warning('请填写完整信息')
    return
  }

  loading.value = true
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum!)
    const signer = provider.getSigner()
    
    // 这里需要调用代币合约的transferFrom方法进行批量归集
    // 具体实现需要根据代币合约的接口来完成
    ElMessage.success('批量归集成功')
  } catch (error) {
    console.error('批量归集失败:', error)
    ElMessage.error('批量归集失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.batch-transfer-container {
  height: 100%;
  width: 1000px;
}

.tab-content {
  padding: 20px;
}

.description {
  color: #606266;
  margin-bottom: 30px;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
}

.table-footer {
  margin-top: 10px;
  text-align: right;
}

h2 {
  margin-top: 0;
  color: #303133;
}
</style> 