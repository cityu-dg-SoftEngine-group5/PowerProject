<template>
  <div class="git-commit-tree">
    <div class="graph-container">
      <RelationGraph
          ref="graphRef"
          :options="graphOptions"
          @on-node-click="onNodeClick"
      >
        <template #node="{node}">
          <el-card
              class="commit-node"
              :style="{
              borderColor: node.borderColor,
              '--node-color': node.color
            }"
              shadow="hover"
              :body-style="{ padding: '12px' }"
          >
            <div class="node-content">
              <!-- 哈希信息 -->
              <div class="hash-row">
                <el-tag size="small" effect="dark" :color="node.color">
                  {{ node.data.commit.hash.substring(0, 7) }}
                </el-tag>
              </div>

              <!-- 作者信息 -->
              <div class="author-row">
                <el-icon><User /></el-icon>
                <span class="author-text">{{ shortenAuthorName(node.data.commit.author) }}</span>
              </div>

              <!-- 时间信息 -->
              <div class="time-row">
                <el-icon><Clock /></el-icon>
                <el-tooltip
                    :content="formatFullTime(node.data.commit.date)"
                    placement="top"
                >
                  <span class="time-text">{{ formatRelativeTime(node.data.commit.date) }}</span>
                </el-tooltip>
              </div>
            </div>
          </el-card>
        </template>
      </RelationGraph>


    </div>

    <el-dialog
        v-model="dialogVisible"
        :title="selectedNode ? selectedNode.message : 'Commit Details'"
        width="50%"
    >
      <div v-if="selectedNode" class="commit-details">
        <div class="detail-row">
          <span class="detail-label">Hash:</span>
          <span class="detail-value">{{ selectedNode.hash }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Author:</span>
          <span class="detail-value">{{ selectedNode.author }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">{{ formatDate(selectedNode.date) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Branch:</span>
          <el-tag
              v-for="branch in selectedNode.branches"
              :key="branch"
              :type="branch === currentBranch ? 'success' : ''"
              class="branch-tag"
          >
            {{ branch }}
          </el-tag>
        </div>
        <div class="detail-row message">
          <span class="detail-label">Message:</span>
          <span class="detail-value">{{ selectedNode.message }}</span>
        </div>
        <div class="detail-row" v-if="selectedNode.parents.length > 0">
          <span class="detail-label">Parents:</span>
          <span class="detail-value">{{ selectedNode.parents.join(', ') }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { User, Clock } from '@element-plus/icons-vue';
import RelationGraph from 'relation-graph/vue3';
import request from '../services/request.js'
import {requestApiCollection} from "../services/api_others.js";
import {ElMessage} from "element-plus";

const commitData = ref([]);
const currentBranch = ref('main');

// Color palette for branches
const branchColors = {
  'main': '#409EFF',
  'master': '#409EFF',
  'develop': '#67C23A',
  'feature': '#E6A23C',
  'release': '#F56C6C',
  'hotfix': '#F56C6C'
};

const graphRef = ref(null);
const dialogVisible = ref(false);
const selectedNode = ref(null);

const graphOptions = ref({
  backgroundImage: "",
  backgroundImageNoRepeat: true,
  disableDragNode: true,
  moveToCenterWhenRefresh: false,
  zoomToFitWhenRefresh: false,
  useAnimationWhenRefresh: true,
  isMoveByParentNode: true,
  defaultExpandHolderPosition: "top",
  defaultNodeBorderWidth: 1,
  defaultNodeBorderColor: "#409EFF",
  defaultLineShape: 3,
  defaultNodeShape: 1,
  layouts: [
    {
      label: "中心",
      layoutName: "tree",
      centerOffset_x: 0,
      centerOffset_y: 0,
      distance_coefficient: 0.8,
      layoutDirection: "h",
      from: "left",
      levelDistance: "250",
      min_per_width: 80,
      max_per_width: 300,
      min_per_height: 300,
      max_per_height: 500,
      maxLayoutTimes: 300,
      force_node_repulsion: 1,
      force_line_elastic: 1
    }
  ]
});

const branchColorCache = {};
const getBranchColor = (branchName) => {
  if (!branchName) return '#909399';

  if (branchColorCache[branchName]) {
    return branchColorCache[branchName];
  }

  const lowerBranch = branchName.toLowerCase();
  for (const [key, value] of Object.entries(branchColors)) {
    if (lowerBranch.includes(key)) {
      branchColorCache[branchName] = value;
      return value;
    }
  }

  // 为未知分支生成稳定颜色
  const hash = branchName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const color = `hsl(${Math.abs(hash % 360)}, 70%, 50%)`;
  branchColorCache[branchName] = color;
  return color;
};

const graphData = computed(() => {
  const nodes = [];
  const lines = [];
  const commitMap = {};

  // 创建提交映射以便快速查找
  commitData.value.forEach(commit => {
    commitMap[commit.hash] = commit;
  });

  commitData.value.forEach(commit => {
    const isCurrentBranch = commit.branches?.includes(currentBranch);
    const primaryBranch = commit.branches?.[0] || '';
    const branchColor = primaryBranch ? getBranchColor(primaryBranch) : '#909399';

    nodes.push({
      id: commit.hash,
      text: '', // 清空text，使用自定义模板
      data: {
        commit,
        branches: commit.branches || []
      },
      color: getBranchColor(commit.branches?.[0]),
      borderColor: isCurrentBranch ? branchColor : '#909399',
      width: 160, // 调整宽度
      height: 110, // 调整高度
      showLabel: false,
      nodeShape: 0
    });

    // 为每个父提交创建连接线
    commit.parents.forEach(parentHash => {
      const parentCommit = commitMap[parentHash];
      if (!parentCommit) return;

      // 找出当前提交和父提交共有的分支
      const commonBranches = commit.branches?.filter(b =>
          parentCommit.branches?.includes(b)
      ) || [];

      // 如果没有共同分支，尝试找出最可能的分支
      let connectingBranches = commonBranches;
      if (commonBranches.length === 0) {
        // 优先使用当前提交的分支
        connectingBranches = commit.branches?.length ? [commit.branches[0]] : [];
        // 如果没有，使用父提交的分支
        if (connectingBranches.length === 0) {
          connectingBranches = parentCommit.branches?.length ? [parentCommit.branches[0]] : [];
        }
      }

      // 为每个连接分支创建单独的线（模拟多条连接）
      connectingBranches.forEach(branch => {
        lines.push({
          from: parentHash,
          to: commit.hash,
          color: getBranchColor(branch),
          lineShape: 3, // 曲线
          text: branch,
          showLabel: true,
          lineWidth: 2,
          isHideArrow: false,
          arrowType: 1,
          arrowSize: 6
        });
      });

      // 如果没有找到任何分支连接，创建一条默认线
      if (connectingBranches.length === 0) {
        lines.push({
          from: parentHash,
          to: commit.hash,
          color: '#909399',
          lineShape: 3,
          text: '',
          showLabel: false,
          lineWidth: 1
        });
      }
    });
  });
  let res = { nodes, links: lines };

  if (nodes.slice(-1)[0]) {
    res.rootId = nodes.slice(-1)[0].id;
  }
  return res;
});

const shortenAuthorName = (author) => {
  if (!author) return '';
  // 显示名字的首字母和姓氏，如 "John Doe" -> "J. Doe"
  const names = author.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}. ${names.slice(1).join(' ')}`;
  }
  return author;
};

// 辅助函数：格式化完整时间
const formatFullTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

// 辅助函数：格式化相对时间（如"2天前"）
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  return 'just now';
};

const onNodeClick = (node) => {
  let currentNode = graphData.value.nodes.find(n => n.id === node.id).data;

  selectedNode.value = {
    message: currentNode.commit.message,
    hash: currentNode.commit.hash,
    date: currentNode.commit.date,
    author: currentNode.commit.author,
    branches: currentNode.commit.branches,
    parents: currentNode.commit.parents
  };

  dialogVisible.value = true;
};

watch(graphData, () => {
  if (graphRef.value) {
    graphRef.value.setOptions(graphOptions.value);
    graphRef.value.setJsonData(graphData.value);
    graphRef.value.refresh();
  }
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const fetchGitLog = async () => {
  try {
    const response = await request.get(requestApiCollection.getGitLogApi, {
      params: {
        repoPath: '/usr/ai_pms/PowerProject'
      }
    });
    commitData.value = response.data;
  } catch (error) {
    console.error('Error fetching GitLog data:', error);
    ElMessage.error('Failed to load GitLog data');
  }
}

onMounted(() => {
  if (graphRef.value) {
    graphRef.value.setOptions(graphOptions.value);
    graphRef.value.setJsonData(graphData.value);
    graphRef.value.refresh();
  }
  fetchGitLog();
});
</script>

<style scoped>
.git-commit-tree {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.graph-container {
  flex: 1;
  min-height: 500px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  contain: strict;
}

.commit-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
}

.detail-label {
  font-weight: bold;
  min-width: 80px;
  color: #606266;
}

.detail-value {
  flex: 1;
  color: #303133;
  word-break: break-word;
}

.message .detail-value {
  white-space: pre-wrap;
}

.commit-node {
  width: 100%;
  height: 100%;
  will-change: transform;
  transition: box-shadow 0.15s ease-out;
  background-color: #ffffff;
}

.commit-node:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.node-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 500;
}

.hash-row {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hash-row :deep(.el-tag) {
  border: none;
  font-family: monospace;
  font-weight: 600;
  padding: 0 6px;
  font-size: 12px;
}

.author-row, .time-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-primary);
  line-height: 1.3;
  font-weight: 500;
}

.author-row .author-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 110px;
  font-weight: 500;
}

.time-row .time-text {
  cursor: help;
  font-size: 11px;
}

.branch-tag {
  border: none;
  font-size: 10px;
  margin-right: 4px;
  margin-bottom: 4px;
  font-weight: 500;
}
</style>
