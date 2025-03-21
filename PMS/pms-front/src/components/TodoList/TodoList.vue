<template>
  <div class="el-main">
    <div class="container">
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
        <el-card class="box-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span>{{ item.title }}</span>
            <el-button style="float: right; padding: 3px 0" type="text">Modify</el-button>
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
      box: [{
        w: "auto",
        h: "auto",
        x: 0,
        y: 0,
        title: "Test",
        todoList: [{description: "task1", isChecked: false}, {description: "task2", isChecked: true}]
      },
        {
          w: "auto",
          h: "auto",
          x: 300,
          y: 400,
          title: "Test",
          todoList: [{description: "task1", isChecked: false}, {description: "task2", isChecked: true}]
        },
        {
          w: "auto",
          h: "auto",
          x: 100,
          y: 200,
          title: "Test",
          todoList: [{description: "task1", isChecked: false}, {description: "task2", isChecked: true}]
        }]
    };
  },
  methods: {
    onDrag(x, y, index) {
      this.box[index].x = x;
      this.box[index].y = y;
      // console.log(x, y, index)
    }
  },
};
</script>

<style scoped>
.container {
  width: 100%;
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