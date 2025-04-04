<template>
  <div class="el-main">
    <el-button @click="showDialog">Add</el-button>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%">
      <el-form :model="item" ref="form" label-width="100px">
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
            <el-button slot="append" icon="el-icon-delete" @click="removeTask(index)"
                       v-if="item.todoList.length > 1"></el-button>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="addTask" :disabled="item.todoList.length >= 4">Add new task</el-button>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelForm">Cancel</el-button>
        <el-button type="primary" @click="submitForm">Confirm</el-button>
      </span>
    </el-dialog>

    <div class="container1" >
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
          @dragging="(x, y) => onDrag(x, y, index)"
          class="drag"
      >
        <el-card class="box-card" shadow="hover" :style="'background-color:' + item.color">
          <div slot="header" class="clearfix">
            <span>{{ item.title }}</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="modifyTodoItem(index)">Modify</el-button>
            <el-button style="float: right; padding: 3px 0" type="text" @click="deleteTodoItem(index)">Delete</el-button>
          </div>
          <el-checkbox v-for="(o, i) in item.todoList" :key="i" class="full-row">
            {{ o.description }}
          </el-checkbox>
        </el-card>
      </vue-drag-resize-rotate>
    </div>
  </div>
</template>

<script>
import VueDragResizeRotate from "@gausszhou/vue-drag-resize-rotate";

export default {
  components: {
    VueDragResizeRotate,
  },
  data() {
    return {
      angle: 0,
      isSnap: true,
      isAllowParent: true,
      isConflictCheck: true,
      dialogVisible: false,
      dialogTitle: 'Add Todo Item',
      isModify: false,
      curIndex: 0,
      item: {title: "", todoList: []},
      box: []
    };
  },
  methods: {
    onDrag(x, y, index) {
      this.box[index].x = x;
      this.box[index].y = y;
    },
    addNewTodoItem(task) {
      task.w = "auto"
      task.h = "auto"
      task.x = 250
      task.y = 250
      this.box.push(task)
    },
    removeTask(index) {
      this.item.todoList.splice(index, 1)
    },
    addTask() {
      if (this.item.todoList.length < 4) {
        this.item.todoList.push({description: '', isChecked: false})
      }
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.isModify) {
            this.box.splice(this.curIndex, 1, this.item)
          } else {
            this.addNewTodoItem(this.item)
          }
          this.dialogVisible = false
          this.item = {title: "", todoList: []}
        } else {
          return false
        }
      })
    },
    cancelForm() {
      this.dialogVisible = false
    },
    showDialog() {
      this.dialogVisible = true
      this.dialogTitle = "Add Todo Item"
      this.isModify = false
    },
    modifyTodoItem(index) {
      this.dialogTitle = "Modify Todo Item"
      this.curIndex = index
      this.item = this.box[index]
      this.dialogVisible = true
      this.isModify = true
    },
    deleteTodoItem(index) {
      this.$confirm('Sure to Delete this Task?', 'Confirm', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.box.splice(index, 1)
        this.$message.success('Successfully Delete')
      }).catch(() => {
        this.$message.info('Cancel Delete');
      })
    }
  },
};
</script>

<style scoped>
.container1 {
  height: 85vh;
  border: 1px solid #ccc;
  position: relative;
  box-sizing: border-box;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both
}

.box-card {
  width: 250px;
  background-color: lightblue;
}

.drag {
  border: white;
}

.full-row {
  width: 100%;
  margin: 5px;
}
</style>