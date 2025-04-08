<template>
  <div class="github-explorer">
    <el-card class="explorer-card" shadow="hover">
      <div class="branch-selector">
        <el-dropdown @command="handleBranchChange" trigger="click">
          <el-button type="primary" text class="branch-button">
            <el-icon><branch /></el-icon>
            <span>{{ currentBranch }}</span>
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                  v-for="branch in branches"
                  :key="branch"
                  :command="branch"
                  :class="{ 'active-branch': currentBranch === branch }"
              >
                {{ branch }}
                <el-icon v-if="currentBranch === branch" class="check-icon"><check /></el-icon>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <div class="file-explorer">
        <div v-loading="isLoadingRepoData" class="file-tree">
          <el-empty v-if="!isLoadingRepoData && fileTree.length === 0" description="No files found" />
          <el-tree
              v-else
              :data="fileTree"
              :props="defaultProps"
              @node-click="handleNodeClick"
              node-key="path"
              :default-expanded-keys="['src']"
              :highlight-current="true"
              :expand-on-click-node="false"
          >
            <template #default="{ node, data }">
              <span class="custom-tree-node">
                <el-icon v-if="data.type === 'directory'">
                  <folder v-if="node.expanded" />
                  <folder-opened v-else />
                </el-icon>
                <el-icon v-else>
                  <component :is="getFileIcon(data)" />
                </el-icon>
                <span class="node-label">{{ node.label }}</span>
              </span>
            </template>
          </el-tree>
        </div>

        <div class="file-content-wrapper">
          <!-- 文件内容和AI分析改为可折叠面板 -->
          <el-collapse v-model="activePanels" class="content-collapse" accordion>
            <!-- 文件内容面板 -->
            <el-collapse-item name="code" :disabled="!selectedFile">
              <template #title>
                <span class="collapse-title">
                  <el-icon><document /></el-icon>
                  <span v-if="selectedFile">{{ selectedFile.name }}</span>
                  <span v-else>No file selected</span>
                </span>
              </template>

              <div v-if="selectedFile" class="file-content" v-loading="isLoading">
                <div class="file-header">
                  <span class="file-path">{{ selectedFile.path }}</span>
                  <div class="file-actions">
                    <el-button
                        v-if="!isBinaryFile"
                        size="small"
                        class="action-button"
                        @click="copyToClipboard"
                    >
                      <el-icon><document-copy /></el-icon>
                      Copy
                    </el-button>
                    <el-button
                        v-if="!isBinaryFile"
                        size="small"
                        type="primary"
                        class="action-button"
                        @click="analyzeWithAI"
                        :loading="isAnalyzing"
                    >
                      <el-icon><magic-stick /></el-icon>
                      Analyze with AI
                    </el-button>
                  </div>
                </div>
                <div v-if="!isBinaryFile" class="code-wrapper">
                  <pre><code ref="codeBlock" :class="getLanguageClass()"></code></pre>
                </div>
                <div v-else class="binary-file">
                  <el-icon :size="48"><document /></el-icon>
                  <p>Binary file not displayed</p>
                </div>
              </div>
              <div v-else class="empty-state1">
                <el-icon :size="48"><document /></el-icon>
                <p>Select a file to view its contents</p>
              </div>
            </el-collapse-item>

            <!-- AI分析结果面板 -->
            <el-collapse-item name="analysis" :disabled="!aiAnalysisResult">
              <template #title>
                <span class="collapse-title">
                  <el-icon><magic-stick /></el-icon>
                  <span>AI Analysis</span>
                  <el-tag v-if="aiAnalysisResult" type="success" size="small" effect="light">
                    Ready
                  </el-tag>
                </span>
              </template>

              <div v-if="aiAnalysisResult" class="ai-result-content">
                <div class="ai-result-header">
                  <span>Analysis of {{ selectedFile?.name }}</span>
                  <el-button
                      size="small"
                      text
                      @click="copyAnalysisResult"
                      class="copy-analysis-btn"
                  >
                    <el-icon><document-copy /></el-icon>
                    Copy
                  </el-button>
                </div>
                <div class="ai-result-text" v-html="formattedAiResult"></div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import {computed, nextTick, ref, onMounted } from 'vue';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import request from '../services/request.js'


// Element Plus icons
import {
  ArrowDown,
  Check,
  Document,
  DocumentCopy,
  Files,
  Folder,
  FolderOpened,
  MagicStick,
  Picture,
  Reading,
  SetUp,
  Tickets,
  View
} from '@element-plus/icons-vue';
import {requestApiCollection} from "../services/api_others.js";
import {ElMessage} from "element-plus";

export default {
  name: 'CodeBrowser',
  components: {
    ArrowDown,
    Check,
    Folder,
    FolderOpened,
    Document,
    DocumentCopy,
    Tickets,
    View,
    Reading,
    Picture,
    SetUp,
    Files,
    MagicStick
  },
  setup() {
    const branches = ref(['main']);
    const currentBranch = ref('main');
    const selectedFile = ref(null);
    const isLoading = ref(false);
    const isLoadingRepoData = ref(false);
    const isAnalyzing = ref(false);
    const fileContents = ref({});
    const codeBlock = ref(null);
    const aiAnalysisResult = ref(null);
    const activePanels = ref(['code']);
    const repositoryData = ref({});

    const defaultProps = {
      children: 'children',
      label: 'name'
    };

    const fileTree = computed(() => {
      if (!currentBranch.value || !repositoryData.value[currentBranch.value]) {
        return [];
      }
      return repositoryData.value[currentBranch.value] || [];
    });

    const isBinaryFile = computed(() => {
      return selectedFile.value && selectedFile.value.type === 'binary';
    });

    const formattedAiResult = computed(() => {
      if (!aiAnalysisResult.value) return '';
      // Simple markdown-like formatting
      return aiAnalysisResult.value
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // bold
          .replace(/\*(.*?)\*/g, '<em>$1</em>') // italic
          .replace(/`(.*?)`/g, '<code>$1</code>') // code
          .replace(/\n/g, '<br>'); // line breaks
    });

    const fetchRepositoryData = async () => {
      isLoadingRepoData.value = true;
      try {
        const response = await request.get(requestApiCollection.getFileListApi, {
          params: {path: '/usr/ai_pms/test'}
        });
        repositoryData.value = response.data;
        branches.value = Object.keys(response.data);

        if (branches.value.length > 0) {
          currentBranch.value = branches.value[0];
        }
      } catch (error) {
        console.error('Error fetching repository data:', error);
        ElMessage.error('Failed to load repository data');
      } finally {
        isLoadingRepoData.value = false;
      }
    };

    const handleBranchChange = (branch) => {
      currentBranch.value = branch;
      selectedFile.value = null;
      aiAnalysisResult.value = null;
    };

    const handleNodeClick = async (data) => {
      if (data.type === 'file') {
        selectedFile.value = data;
        aiAnalysisResult.value = null;
        activePanels.value = ['code'];

        const cacheKey = `${currentBranch.value}-${data.path}`;
        if (fileContents.value[cacheKey] === 'Error loading file content' || !fileContents.value[cacheKey]) {
          isLoading.value = true;
          try {
            const response = await request(requestApiCollection.getFileContentApi, {
              params: {
                filepath: data.path
              }
            });

            fileContents.value[cacheKey] = response.data.content;
          } catch (error) {
            console.error('Error fetching file content:', error);
            fileContents.value[cacheKey] = 'Error loading file content';
          } finally {
            isLoading.value = false;
          }
        }

        nextTick(() => {
          if (!isLoading.value && !isBinaryFile.value) {
            highlightCode();
          }
        });
      }
    };

    const getFileIcon = (data) => {
      if (data.type === 'directory') return Folder;

      const extension = data.name.split('.').pop();
      switch(extension) {
        case 'js': return SetUp;
        case 'vue': return View;
        case 'json': return Files;
        case 'md': return Reading;
        case 'html': return Tickets;
        case 'ico': return Picture;
        case 'css': return Tickets;
        case 'txt': return Document;
        default: return Document;
      }
    };

    const getLanguageClass = () => {
      if (!selectedFile.value) return '';
      const extension = selectedFile.value.name.split('.').pop();

      switch(extension) {
        case 'js': return 'language-javascript line-numbers';
        case 'vue': return 'language-markup line-numbers';
        case 'json': return 'language-json line-numbers';
        case 'md': return 'language-markdown line-numbers';
        case 'html': return 'language-markup line-numbers';
        case 'css': return 'language-css line-numbers';
        case 'txt': return 'language-markup line-numbers';
        default: return 'language-markup line-numbers';
      }
    };

    const highlightCode = () => {
      if (selectedFile.value && !isBinaryFile.value && codeBlock.value) {
        const cacheKey = `${currentBranch.value}-${selectedFile.value.path}`;
        codeBlock.value.textContent = fileContents.value[cacheKey];
        Prism.highlightElement(codeBlock.value);
      }
    };

    const analyzeWithAI = async () => {
      if (!selectedFile.value || isBinaryFile.value) return;

      isAnalyzing.value = true;
      try {
        const response = await request(requestApiCollection.sendFileToAiApi, {
          params: {
            filepath: selectedFile.value.path
          }
        });
        if (response.data.status === 0)
          throw Error("server status failed");
        aiAnalysisResult.value = response.data.content;
        activePanels.value = ['analysis'];
      } catch (error) {
        console.error('AI analysis failed:', error);
        ElMessage.error('Failed to analyze with AI');
      } finally {
        isAnalyzing.value = false;
      }
    };

    const copyToClipboard = async () => {
      if (!selectedFile.value) return;

      const cacheKey = `${currentBranch.value}-${selectedFile.value.path}`;
      const content = fileContents.value[cacheKey];

      try {
        await navigator.clipboard.writeText(content);
        ElMessage.success('Copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy: ', err);
        ElMessage.error('Failed to copy text');
      }
    };

    const copyAnalysisResult = async () => {
      if (!aiAnalysisResult.value) return;

      try {
        await navigator.clipboard.writeText(aiAnalysisResult.value);
        ElMessage.success('Analysis copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy analysis: ', err);
        ElMessage.error('Failed to copy analysis');
      }
    };

    onMounted(() => {
      fetchRepositoryData();
    });

    return {
      branches,
      currentBranch,
      selectedFile,
      isLoading,
      isAnalyzing,
      fileContents,
      defaultProps,
      repositoryData,
      fileTree,
      isBinaryFile,
      codeBlock,
      aiAnalysisResult,
      activePanels,
      formattedAiResult,
      isLoadingRepoData,
      handleBranchChange,
      handleNodeClick,
      getFileIcon,
      getLanguageClass,
      highlightCode,
      copyToClipboard,
      analyzeWithAI,
      copyAnalysisResult
    };
  }
}
</script>

<style scoped>
.github-explorer {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
  Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  height: 100%;
}

.explorer-card {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.branch-selector {
  margin-bottom: 15px;
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 10px 15px;
  display: flex;
  align-items: center;
}

.branch-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.file-explorer {
  flex: 1;
  display: flex;
  border-radius: 6px;
  overflow: hidden;
  min-height: 0;
  position: relative;
}

.file-tree {
  width: 280px;
  border-right: 1px solid var(--el-border-color-light);
  padding: 8px 0;
  overflow: auto;
  background-color: var(--el-fill-color-lighter);
}

.file-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.file-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.file-header {
  padding: 12px 16px;
  background-color: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-path {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.code-wrapper {
  flex: 1;
  overflow: auto;
}

pre {
  margin: 0;
  padding: 16px;
  background-color: #f6f8fa;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  line-height: 1.5;
  overflow-x: auto;
  tab-size: 2;
}

code {
  font-family: inherit;
}

.empty-state1, .binary-file {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--el-text-color-secondary);
  background-color: var(--el-fill-color-lighter);
  padding: 20px;
  height: 100%;
}

.empty-state p, .binary-file p {
  margin: 0;
  font-size: 14px;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  font-size: 14px;
}

.node-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.el-tree {
  background-color: transparent;
}

.el-tree-node__content {
  height: 32px;
}

.el-tree-node:focus > .el-tree-node__content {
  background-color: var(--el-color-primary-light-9);
}

.el-tree-node.is-current > .el-tree-node__content {
  background-color: var(--el-color-primary-light-9);
  font-weight: 500;
}

.active-branch {
  color: var(--el-color-primary);
  font-weight: 500;
}

.check-icon {
  margin-left: 8px;
  color: var(--el-color-primary);
}

/* Line numbers styling */
.line-numbers .line-numbers-rows {
  border-right: 1px solid var(--el-border-color);
  padding-right: 12px;
}

.line-numbers-rows > span:before {
  color: var(--el-text-color-placeholder);
  padding-right: 8px;
}

.ai-result-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: auto;
}

.ai-result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.copy-analysis-btn {
  padding: 0;
}

.ai-result-text {
  flex: 1;
  line-height: 1.6;
  overflow: auto;
}

.ai-result-text strong {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.ai-result-text em {
  font-style: italic;
  color: var(--el-text-color-secondary);
}

.ai-result-text code {
  background-color: var(--el-fill-color);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: var(--el-font-family-mono);
  font-size: 0.9em;
}

:deep(.el-collapse-item__header) {
  background-color: var(--el-fill-color-lighter);
  padding: 0 16px;
  font-weight: 500;
}

:deep(.el-collapse-item__content) {
  padding-bottom: 0;
}

.content-collapse {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: none;
}

.content-collapse :deep(.el-collapse-item__header) {
  height: 48px;
  padding: 0 16px;
  font-weight: 500;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-fill-color-lighter);
}

.content-collapse :deep(.el-collapse-item__content) {
  padding-bottom: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-collapse :deep(.el-collapse-item__wrap) {
  border-bottom: none;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

</style>