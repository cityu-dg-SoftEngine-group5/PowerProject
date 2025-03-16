<template>
  <div>
    <div style="margin-bottom: 5px;">
      <el-button type="primary" style="margin-left: 5px;" @click="add">新增</el-button>
    </div>
    <el-table :data="applicationList"
              :header-cell-style="{ background: '#f2f5fc', color: '#555555' }"
              highlight-current-row
              @current-change="selectCurrentChange"
              border>
      <el-table-column label="ID" width="60">
        <template slot-scope="scope">{{ scope.$index + 1 }}</template>
      </el-table-column>
      <el-table-column prop="myname" label="姓名" width="120"></el-table-column>
      <el-table-column prop="drugName" label="药品名" width="180"></el-table-column>
      <el-table-column prop="quantity" label="数量" width="80"></el-table-column>
      <el-table-column prop="approver" label="审批人" width="120"></el-table-column>
      <el-table-column prop="status" label="状态" width="140">
        <template slot-scope="scope">
          <el-tag
              :type="getStatusTagType(scope.row.status)"
              disable-transitions
          >{{ getStatusText(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180px">
        <template slot-scope="scope">
<!--          <el-button  :type="scope.row.status === 0 ? 'danger' : 'info'" size="mini" :disabled="scope.row.status !== 0" @click="del(scope.row.id)" style="margin-right: 5px;">撤回</el-button>-->
          <el-popconfirm
              title="确定撤回吗？"
              @confirm="del(scope.row.id)"
              style="margin-left: 5px;"
          >
            <el-button slot="reference" size="mini" :type="scope.row.status === 0 ? 'danger' : 'info'" :disabled="scope.row.status !== 0">撤回</el-button>
          </el-popconfirm>
          <!-- 归还按钮 -->
<!--          <el-button v-if="scope.row.status ===2" :type="scope.row.status === 2 ? 'success' : 'info'"-->
<!--                     size="mini"-->
<!--                     :disabled="scope.row.status !== 2"-->
<!--                     @click="showReturnDialog(scope.row)">归还</el-button>-->


<!--          <el-popover-->
<!--              placement="top"-->
<!--              width="160"-->
<!--              v-model="visible"-->
<!--          >-->
<!--            <p>确定归还吗？</p>-->
<!--            <div style="text-align: right; margin: 0">-->
<!--              <el-button size="mini" type="text" @click="visible = false">取消</el-button>-->
<!--              <el-button type="primary" size="mini" @click="returnM(scope.row.id)">确定</el-button>-->
<!--            </div>-->
<!--            <el-button slot="reference" :disabled="scope.row.status !== 2 && scope.row.status !== 4">归还</el-button>-->
<!--          </el-popover>-->

          <el-popconfirm
              title="确定归还吗？"
              @confirm="returnM(scope.row.id)"
              style="margin-left: 5px;"
          >
            <el-button slot="reference" size="mini" type="success" :disabled="scope.row.status !== 2 && scope.row.status !== 4" >归还</el-button>
          </el-popconfirm>




        </template>
      </el-table-column>
      <el-table-column prop="remarks" label="备注" width="180"></el-table-column>
    </el-table>
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageNum"
        :page-sizes="[5, 10, 20,30]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
    </el-pagination>



    <el-dialog
        title="新增借用申请"
        :visible.sync="centerDialogVisible"
        width="30%"
        center>

      <el-form ref="form" :rules="rules" :model="form" label-width="80px">
<!--        <el-form-item label="药品名" prop="name">-->
<!--          <el-col :span="20">-->
<!--            <el-input v-model="form.name"></el-input>-->
<!--          </el-col>-->
<!--        </el-form-item>-->
        <el-form-item label="药品名" prop="drug">
          <el-col :span="20">
            <el-select v-model="form.drugName" placeholder="请选择药品" style="margin-left: 5px;">
              <el-option
                  v-for="item in drugs"
                  :key="item.id"
                  :label="item.name"
                  :value="item.name">
              </el-option>
            </el-select>

          </el-col>
        </el-form-item>

        <el-form-item label="审批人" prop="approver">
          <el-col :span="20">
            <el-select v-model="form.approver" placeholder="请选择审批人" style="margin-left: 5px;">
              <el-option
                  v-for="item in approvers"
                  :key="item.id"
                  :label="item.name"
                  :value="item.name">
              </el-option>
            </el-select>

          </el-col>
        </el-form-item>
<!--        <el-form-item label="分类" prop="goodstype">-->
<!--          <el-col :span="20">-->
<!--            <el-select v-model="form.goodstype" placeholder="请选择分类" style="margin-left: 5px;">-->
<!--              <el-option-->
<!--                  v-for="item in goodstypeData"-->
<!--                  :key="item.id"-->
<!--                  :label="item.name"-->
<!--                  :value="item.id">-->
<!--              </el-option>-->
<!--            </el-select>-->
<!--          </el-col>-->
<!--        </el-form-item>-->
        <el-form-item label="数量" prop="count">
          <el-col :span="20">
            <el-input v-model="form.quantity"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-col :span="20">
            <el-input type="textarea" v-model="form.remarks"></el-input>
          </el-col>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="centerDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="save">确 定</el-button>
  </span>
    </el-dialog>







  </div>


</template>
<script>
import axios from 'axios';

export default {
  data() {
    return {
      applicationList: [],
      dialogVisible: false,
      visible: false,
      centerDialogVisible:false,
      form: {
        drugName: '',
        quantity: '',
        approver: '',
        remarks: '',
      },



      rules: {
        // drugName: [{ required: true, message: '请选择药品名', trigger: 'change' }],
        // quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
        // approver: [{ required: true, message: '请选择申请人', trigger: 'change' }],
        // drug: [
        //   {required: true, message: '请选择药品', trigger: 'blur'}
        // ],
        // approver:[
        //   {required: true, message: '请选择审批人', trigger: 'blur'}
        // ],
        // quantity:[
        //   {required: true, message: '请输入数量', trigger: 'blur'}
        // ],
      },




      user: JSON.parse(sessionStorage.getItem('CurUser')),
      drugs: [],
      approvers: [],

      //分页
      pageSize:10,
      pageNum:1,
      total:0,



      returnDialogVisible: false, // 归还弹窗是否显示
      returnDialogData: {}, // 归还药品的信息
      returnFormData: { // 归还表单数据
        returned: 0 // 归还数量
      },

    }
  },
  mounted() {
    this.getApplicationList();
    this.getDrugList();
    this.getApproverList();
    console.log(this.user.name)
  },
  methods: {
    openDialog() {
      this.dialogVisible = true;
    },


    showReturnDialog(data) {
      this.returnDialogData = data;
      this.returnDialogVisible = true;
    },



    save() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const {drugName, quantity, approver, remarks } = this.form;
          axios.post(this.$httpUrl+'/application/save', { myname: this.user.name, drugName, quantity, approver, remarks})
              .then(() => {
                this.centerDialogVisible = false;
                this.$message.success('保存成功');
                this.getApplicationList();
                this.resetParam();
              })
              .catch(error => {
                console.error(error);
                this.$message.error('保存失败');
              });
        }
      });
    },
    del(id) {
      // this.$confirm('确定删除该申请吗？', '提示', { type: 'warning' })
      //     .then(() => {
      //       axios.get(this.$httpUrl+`/application/delete?id=`+id)
      //           .then(() => {
      //             this.$message.success('删除成功');
      //             this.getApplicationList();
      //           })
      //           .catch(error => {
      //             console.error(error);
      //             this.$message.error('删除失败');
      //           });
      //     })
      //     .catch(() => {
      //       // 取消删除
      //     });
      this.$axios.get(this.$httpUrl+`/application/delete?id=`+id)
            .then(() => {
              this.$message.success('删除成功');
              this.getApplicationList();
            })
            .catch(error => {
              console.error(error);
              this.$message.error('删除失败');
            });

    },
    // getApplicationList(name) {
    //   axios.get(this.$httpUrl+'/application/listPage?myname='+name)
    //       .then(res=>res.data).then(res => {
    //         this.applicationList = res.data;
    //       })
    // },

    //改成分页
    getApplicationList() {

      axios.post(this.$httpUrl + '/application/listPage', {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        param: {
          myname: this.user.name
        }
      }).then(res=>res.data).then(res => {
        console.log(res)
        if(res.code==200){
          this.applicationList=res.data
          this.total=res.total}
      }).catch(error => {
        console.error(error)
        this.$message.error('获取数据失败')
      })
    },

    selectCurrentChange(val) {
      this.currentRow = val;
    },
    getDrugList() {
      axios.get(this.$httpUrl+'/goods/list')
          .then(res=>res.data).then(res => {
            this.drugs = res.data;
          })
    },
    getApproverList() {
      axios.get(this.$httpUrl+'/user/list')
          .then(res=>res.data).then(res => {
            this.approvers = res.data.filter(user => user.roleId === 0 || user.roleId === 1);
            this.form.approver=res.data.filter(user => user.roleId === 0 || user.roleId === 1);
            // this.approvers = response.data;
          })
    },
    getStatusTagType(status) {
      switch (status) {
        case 0:
          return 'warning';
        case 1:
          return 'success';
        case 2:
          return 'success';
        case 3:
          return 'danger';
        default:
          return '';
      }
    },
    resetParam(){
      this.form.drugName='',
      this.form.approver='',
      this.form.quantity='',
      this.form.remarks=''
    },
    resetForm() {
      this.$refs.form.resetFields();
    },

    add(){
      this.centerDialogVisible = true

    },






    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
      this.pageNum=1
      this.pageSize=val
      this.getApplicationList()
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      this.pageNum=val
      this.getApplicationList()
    },

    returnM(id) {
      this.$axios.put(this.$httpUrl + `/application/update/${id}`, {status: 1}).then(res => {
        // 更新成功后，重新获取数据，重新渲染表格
        this.getApplicationList()
      }).catch(err => {
        console.log(err)
      })
    },



    returnSave(form1){
      this.$axios.post(this.$httpUrl+'/goods/save',form1).then(res=>res.data).then(res=>{
        console.log(res)
        if(res.code==200){

          this.$message({
            message: '操作成功！',
            type: 'success'
          });
          this.centerDialogVisible = false
          this.loadPost()
          this. resetForm()
        }else{
          this.$message({
            message: '操作失败！',
            type: 'error'
          });
        }

      })
    },




    getStatusText(status) {
      switch (status) {
        case 0:
          return '待审批';
        case 1:
          return '已归还';
        case 2:
          return '已通过，未归还';
        case 3:
          return '已被拒绝';
        case 4:
          return '已通过，未归还';
        case 5:
          return '已归还';

        default:
          return '';
      }
    },
  },
};
</script>
