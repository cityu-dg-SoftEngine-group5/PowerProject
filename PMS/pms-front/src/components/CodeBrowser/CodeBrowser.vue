<template>
  <div class="github-explorer">
    <el-card class="explorer-card">
      <div class="branch-selector" >
        <el-dropdown @command="handleBranchChange" trigger="click">
          <el-button type="text" class="branch-button">
            <i class="el-icon-s-operation"></i>
            {{ currentBranch }} <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="branch in branches" :key="branch" :command="branch">
              {{ branch }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>

      <div class="file-explorer">
        <div class="file-tree">
          <el-tree
              :data="fileTree"
              :props="defaultProps"
              @node-click="handleNodeClick"
              node-key="path"
              :default-expanded-keys="['src']"
              :highlight-current="true"
          >
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span>
                <i :class="getIconForFile(data)"></i>
                {{ node.label }}
              </span>
            </span>
          </el-tree>
        </div>

        <div class="file-content" v-if="selectedFile" v-loading="isLoading">
          <div class="file-header">
            <span class="file-name">{{ selectedFile.name }}</span>
            <span class="file-path">{{ selectedFile.path }}</span>
          </div>
          <pre v-if="!isBinaryFile"><code ref="codeBlock" :class="getLanguageClass()"></code></pre>
          <div v-else class="binary-file">
            <i class="el-icon-document"></i>
            <p>Binary file not displayed</p>
          </div>
        </div>
        <div class="empty-state" v-else>
          <i class="el-icon-document"></i>
          <p>Select a file to view its contents</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
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

export default {
  name: 'CodeBrowser',
  data() {
    return {
      branches: ['main', 'develop'],
      currentBranch: 'main',
      selectedFile: null,
      isLoading: false,
      fileContents:[],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      // Sample repository data structure
      repositoryData: {
        main: {
          fileTree: [{
            name: 'src',
            path: 'src',
            type: 'directory',
            children: [
              {
                name: 'abc.txt',
                path: 'src/abc.txt',
                type: 'file'
              }
            ]
          }]
        },
        'develop': {
          fileTree: []
        },
      }
    }
  },
  computed: {
    fileTree() {
      return this.repositoryData[this.currentBranch].fileTree;
    },
    isBinaryFile() {
      return this.selectedFile && this.selectedFile.content === '[Binary File]';
    }
  },
  methods: {
    handleBranchChange(branch) {
      this.currentBranch = branch;
      this.selectedFile = null;
    },
    async handleNodeClick(data) {
      if (data.type === 'file') {
        this.selectedFile = data;
        // Check if we already have the content in cache
        const cacheKey = `${this.currentBranch}-${data.path}`;
        if (!this.fileContents[cacheKey]) {
          // If not in cache, fetch it
          this.isLoading = true;
          try {
            const content = await this.fetchFileContent(data.path, this.currentBranch);
            this.$set(this.fileContents, cacheKey, content);
          } catch (error) {
            console.error('Error fetching file content:', error);
            this.$set(this.fileContents, cacheKey, 'Error loading file content');
          } finally {
            this.isLoading = false;
          }
        }

        this.$nextTick(() => {
          if (!this.isLoading && !this.isBinaryFile) {
            this.highlightCode();
          }
        });
      }
    },
    getIconForFile(data) {
      if (data.type === 'directory') {
        return 'el-icon-folder';
      }

      const extension = data.name.split('.').pop();

      switch(extension) {
        case 'js':
          return 'el-icon-tickets';
        case 'vue':
          return 'el-icon-view';
        case 'json':
          return 'el-icon-document';
        case 'md':
          return 'el-icon-reading';
        case 'html':
          return 'el-icon-document';
        case 'ico':
          return 'el-icon-picture';
        default:
          return 'el-icon-document';
      }
    },
    getLanguageClass() {
      if (!this.selectedFile) return '';

      const extension = this.selectedFile.name.split('.').pop();

      switch(extension) {
        case 'js':
          return 'language-javascript line-numbers';
        case 'vue':
          return 'language-markup line-numbers';
        case 'json':
          return 'language-json line-numbers';
        case 'md':
          return 'language-markdown line-numbers';
        case 'html':
          return 'language-markup line-numbers';
        case 'css':
          return 'language-css line-numbers';
        case 'ts':
          return 'language-typescript line-numbers';
        default:
          return 'language-markup line-numbers';
      }
    },
    highlightCode() {
      if (this.selectedFile && !this.isBinaryFile && this.$refs.codeBlock) {
        const codeElement = this.$refs.codeBlock;
        codeElement.textContent = this.fileContents[`${this.currentBranch}-${this.selectedFile.path}`];
        Prism.highlightElement(codeElement);
      }
    },
    fetchFileContent(filePath, branch) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const fileContent = "this.getMockFileContent(" + filePath + ", " + branch + ")";
          if (fileContent) {
            resolve(fileContent);
          } else {
            reject(new Error('File not found'));
          }
        }, 500); // Simulate a 500ms delay
      });
    }
  },
  mounted() {
    // Prism.plugins.lineNumbers.init();
  }
}
</script>

<style>
.github-explorer {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.explorer-card {
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.branch-selector {
  margin-bottom: 15px;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 15px;
}

.branch-button {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.file-explorer {
  height: 75vh;
  display: flex;
  border: 1px solid #eaeaea;
  border-radius: 6px;
  overflow: hidden;
}

.file-tree {
  width: 300px;
  border-right: 1px solid #eaeaea;
  padding: 10px;
  overflow: auto;
  max-height: 600px;
}

.file-content {
  flex: 1;
  padding: 0;
  overflow: auto;
  max-height: 75vh;
  background-color: white; /* Dark background for code */
}

.file-header {
  padding: 10px 15px;
  background-color: #f6f8fa;
  border-bottom: 1px solid #eaeaea;
  color: #24292e;
}

.file-name {
  font-weight: bold;
  margin-right: 10px;
}

.file-path {
  color: #6a737d;
  font-size: 12px;
}

pre {
  margin: 0;
  padding: 0;
  background-color: #2d2d2d;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-x: auto;
  tab-size: 2;
}

code {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

.empty-state, .binary-file {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #6a737d;
  background-color: #f6f8fa;
}

.empty-state i, .binary-file i {
  font-size: 48px;
  margin-bottom: 15px;
}

.custom-tree-node {
  display: flex;
  align-items: center;
}

.custom-tree-node i {
  margin-right: 5px;
}

/* Line numbers styling */
.line-numbers .line-numbers-rows {
  border-right: 1px solid #6a737d;
}

.line-numbers-rows > span:before {
  color: #6a737d;
}
</style>