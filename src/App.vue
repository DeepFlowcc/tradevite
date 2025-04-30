<script lang="ts" setup>
import { ElContainer, ElHeader, ElMain, ElAside } from 'element-plus'
import WalletConnect from './components/WalletConnect.vue'
import Sidebar from './components/Sidebar.vue'
</script>

<template>
  <div class="app">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1>dflow-hackathon</h1>
          <WalletConnect />
        </div>
      </el-header>
      <el-container class="main-container">
        <el-aside width="250px">
          <Sidebar @chain-change="(chain) => {}" @dex-change="(dex) => {}" @menu-change="(menu) => {}" />
        </el-aside>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style>
.app {
  min-height: 100vh;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  padding: 0 20px;
}

.main-container {
  height: calc(100vh - 60px);
}

.el-aside {
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
}

.el-main {
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}
</style>
