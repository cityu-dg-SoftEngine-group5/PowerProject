<template>
  <div class="el-main">
    <el-card shadow="hover" class="outside_card" >
      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="50%">
        <el-form :model="item" ref="formRef" label-width="100px">
          <el-form-item label="color" prop="color">
            <el-color-picker v-model="item.color" show-alpha
                             :predefine="['#C8F2D4', '#D0E7FF', '#FFDAD6', '#FFF1B8', '#E6D9FF']"></el-color-picker>
            <span class="color-preview" :style="{ backgroundColor: item.color }"></span>
          </el-form-item>

          <el-form-item label="title" prop="title"
                        :rules="{ required: true, message: 'Title cannot be null', trigger: ['blur', 'change'] }">
            <el-input v-model="item.title" placeholder="Please enter the title"></el-input>
          </el-form-item>

          <el-form-item
              v-for="(task, index) in item.todoList"
              :key="index"
              :label="'task ' + (index + 1)"
              :prop="'todoList[' + index + '].description'"
              :rules="{ required: true, message: 'Description cannot be null', trigger: ['blur', 'change'] }"
          >
            <el-input v-model="task.description" placeholder="Please enter the description of this task">
              <template #append>
                <el-button :icon="Delete" @click="removeTask(index)"
                           v-if="item.todoList.length > 1"></el-button>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="addTask" :disabled="item.todoList.length >= 4">Add new task</el-button>
          </el-form-item>
        </el-form>

        <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelForm()">Cancel</el-button>
          <el-button type="primary" @click="submitForm(formRef)">Confirm</el-button>
        </span>
        </template>
      </el-dialog>

      <div class="container1">
        <el-affix position="top" :offset="20">
          <div class="header-container">
            <el-button
                type="primary"
                round
                class="action-button"
                @click="showDialog"
            >
              <el-icon><Plus /></el-icon>
              Add New Task
            </el-button>
          </div>
        </el-affix>
        <vue-drag-resize-rotate
            v-for="(item, index) in box"
            :key="index"
            :w="item.w"
            :h="item.h"
            :x="item.x"
            :y="item.y"
            :parent="isAllowParent"
            :handles="[]"
            :snap="isSnap"
            :snapTolerance="20"
            :isConflictCheck="isConflictCheck"
            @dragstop="(x, y) => onDragStop(x, y, index)"
            class="drag"
        >
          <el-card class="box-card" shadow="hover" :style="'background-color:' + item.color">
            <template #header>
              <div class="card-header">
                <span class="card-title">{{ item.title }}</span>
                <div class="card-actions">
                  <el-button
                      circle
                      size="small"
                      @click="modifyTodoItem(index)"
                      class="action-btn"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button
                      circle
                      size="small"
                      @click="deleteTodoItem(index)"
                      class="action-btn"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            <el-checkbox v-for="(o, i) in item.todoList" :key="i" v-model="o.isChecked" class="full-row">
              {{ o.description }}
            </el-checkbox>
          </el-card>
        </vue-drag-resize-rotate>
      </div>
    </el-card>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Delete, Edit } from '@element-plus/icons-vue';
import axios from "axios";
import {requestApiCollection} from "../services/api_others.js";

// Reactive state
const angle = ref(0);
const isSnap = ref(true);
const isAllowParent = ref(true);
const isConflictCheck = ref(true);
const dialogVisible = ref(false);
const dialogTitle = ref('Add Todo Item');
const isModify = ref(false);
const curIndex = ref(0);
const loading = ref(false);
const formRef = ref(null);

const item = reactive({
  x:0,
  y:0,
  w:"auto",
  h:"auto",
  title: "",
  color: "#D0E7FF",
  todoList: []
});

const box = ref([]);

// Lifecycle hooks
onMounted(() => {
  fetchTodos();
});

// Methods
const fetchTodos = async () => {
  try {
    loading.value = true;
    const response = await axios.get(requestApiCollection.getTodoListApi);
    box.value = response.data;

    // Ensure each item has the required properties for the drag component
    box.value.forEach(item => {
      if (!item.w) item.w = "auto";
      if (!item.h) item.h = "auto";
      if (!item.x) item.x = 250;
      if (!item.y) item.y = 250;
      if (!item.color) item.color="#D0E7FF";
    });
  } catch (error) {
    ElMessage.error('Failed to fetch todo items: ' + error.message);
    console.error('Error fetching todos:', error);
    box.value = [];
  } finally {
    loading.value = false;
  }
};

const onDragStop = (x, y, index) => {
  box.value[index].x = x;
  box.value[index].y = y;
};

const addNewTodoItem = (task) => {
  task.w = "auto";
  task.h = "auto";
  task.x = 250;
  task.y = 250;
  box.value.push(task);
};

const removeTask = (index) => {
  item.todoList.splice(index, 1);
};

const addTask = () => {
  if (item.todoList.length < 4) {
    item.todoList.push({ description: '', isChecked: false });
  }
};

const submitForm = (formRef) => {
  formRef.validate((valid) => {
    if (valid) {
      if (isModify.value) {
        box.value.splice(curIndex.value, 1, { ...item });
      } else {
        addNewTodoItem({ ...item });
      }
      dialogVisible.value = false;
      resetForm();
      updateTodoListToServer();
    } else {
      return false;
    }
  });
};

const resetForm = () => {
  item.title = "";
  item.color = "#D0E7FF";
  item.todoList = [
    { description: '', isChecked: false }
  ];
};

const cancelForm = () => {
  dialogVisible.value = false;
  resetForm();
};

const showDialog = () => {
  dialogVisible.value = true;
  dialogTitle.value = "Add Todo Item";
  isModify.value = false;
  resetForm();
};

const modifyTodoItem = (index) => {
  dialogTitle.value = "Modify Todo Item";
  curIndex.value = index;

  // Deep copy the item to avoid direct reference
  let selectedItem = box.value[index];
  item.x = selectedItem.x;
  item.y = selectedItem.y;
  item.w = selectedItem.w;
  item.h = selectedItem.h;
  item.title = selectedItem.title;
  item.color = selectedItem.color;
  item.todoList = [...selectedItem.todoList.map(task => ({ ...task }))];

  dialogVisible.value = true;
  isModify.value = true;
};

const updateTodoListToServer = () => {
  axios.post(requestApiCollection.updateTodoListApi, {
    "todolist": box.value
  }).catch((error) => {
    console.error('Error updating todos:', error);
  });
};

const deleteTodoItem = (index) => {
  ElMessageBox.confirm('Sure to Delete this Task?', 'Confirm', {
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(() => {
    box.value.splice(index, 1);
    updateTodoListToServer();
    ElMessage.success('Successfully Delete');
  }).catch(() => {
    ElMessage.info('Cancel Delete');
  });
};
</script>

<style scoped>
.container1 {
  height: calc(82vh);
  position: relative;
  box-sizing: border-box;
}

.box-card {
  width: 250px;  /* 增大宽度 */

  border-radius: 12px;
  transition: all 0.3s ease;
  border: none;
}

.box-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  flex-grow: 1;
}

.action-btn {
  padding: 6px;
  color: #666;
  transition: all 0.2s;
}

.action-btn:hover {
  color: #409EFF;
  background: rgba(64, 158, 255, 0.1);
}

.drag {
  border: white;
}

.full-row {
  width: 100%;
  margin: 5px;
}

.todo-header h2 {
  color: #409EFF;
  font-size: 28px;
  font-weight: 500;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.outside_card {
  width: 100%;
  border-radius: 16px;
  border: none;
  background-color: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
}

.outside-card :hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
}

.outside-card :deep(.el-card__body) {
  padding: 0;
  height: 100%;
}
</style>