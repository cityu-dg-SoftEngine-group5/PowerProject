<template>
  <div>
<!--    <div style="margin-bottom: 5px;">-->
<!--      <el-button type="primary" style="margin-left: 5px;" @click="openDialog">新增</el-button>-->
<!--    </div>-->
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
      <el-table-column prop="status" label="状态" width="140" >
        <template slot-scope="scope">
          <el-tag
              :type="getStatusTagType(scope.row.status)"
              disable-transitions
          >{{ getStatusText(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="operate" label="操作" width="180px">
        <template slot-scope="scope">
<!--          <el-button :type="scope.row.status === 0 ? 'danger' : 'info'" size="mini" :disabled="scope.row.status !== 0" @click="del(scope.row.id)">撤回</el-button>-->
<!--            <el-button size="mini" v-if="scope.row.status==0" type="success" @click="approve(scope.row.id)" :disabled="scope.row.status !== 0">同意</el-button>-->
<!--            <el-button size="mini" v-if="scope.row.status===0" type="danger" :disabled="scope.row.status !== 0" @click="deny(scope.row.id)">拒绝</el-button>-->



          <template>
            <el-popconfirm
                title="确定同意吗？"
                @confirm="approve(scope.row.id)"
                v-if="scope.row.status===0"
                style="margin-left: 5px;"
            >
              <el-button slot="reference" size="mini" type="success" :disabled="scope.row.status !== 0" >同意</el-button>
            </el-popconfirm>
          </template>

          <template>
            <el-popconfirm
                title="确定拒绝吗？"
                @confirm="deny(scope.row.id)"
                v-if="scope.row.status==0"
                style="margin-left: 5px;"
            >
              <el-button slot="reference" size="mini" type="danger" :disabled="scope.row.status !== 0" >拒绝</el-button>
            </el-popconfirm>
          </template>



<!--            <el-popconfirm-->
<!--                title="确定拒绝吗？"-->
<!--                @confirm="deny(scope.row.id)"-->
<!--                style="margin-left: 5px;"-->
<!--            >-->
<!--              <el-button v-if="scope.row.status==0"  slot="reference" size="mini" type="danger" :disabled="scope.row.status !== 0" >拒绝</el-button>-->
<!--            </el-popconfirm>-->


<!--            <el-button v-if="scope.row.status==2" type="success" :disabled="scope.row.outClicked" @click="approve(scope.row.id); scope.row.outClicked = true">出库</el-button>-->
<!--            <el-button v-if="scope.row.status==1" type="danger"  @click="deny(scope.row.id); scope.row.inClicked = true">入库</el-button>-->


<!--            <el-button v-if="scope.row.status==2 || scope.row.status==4" type="success" :disabled="scope.row.status ===4" @click="outM(scope.row)">-->
<!--              {{ scope.row.status === 4 ? '已出库' : '出库' }}-->
<!--            </el-button>-->




          <template>
            <el-popconfirm
                title="确定出库吗？"
                @confirm="outM(scope.row)"
                v-if="scope.row.status==2 || scope.row.status==4"
                :disabled="scope.row.status ===4"
                style="margin-left: 5px;"
            >
              <el-button slot="reference" size="mini" type="success" >{{ scope.row.status === 4 ? '已出库' : '出库' }}</el-button>
            </el-popconfirm>
          </template>


          <template>
            <el-button type="danger" @click="open(scope.row)" v-if="scope.row.status===1 || scope.row.status===5"
                       :disabled="scope.row.status ===5">{{ scope.row.status === 5 ? '已入库' : '入库' }}</el-button>
          </template>










          <!--            <el-button v-if="scope.row.status==1 || scope.row.status==5" type="danger" :disabled="scope.row.status ===5" @click="inM(scope.row)">-->
<!--              {{ scope.row.status === 5 ? '已入库' : '入库' }}-->
<!--            </el-button>-->

<!--          <template>-->
<!--            <el-popconfirm-->
<!--                title="确定入库吗？"-->
<!--                @confirm="inM(scope.row)"-->
<!--                v-if="scope.row.status==1 || scope.row.status==5"-->
<!--                style="margin-left: 5px;"-->
<!--            >-->
<!--              <el-button slot="reference" size="mini" type="danger" :disabled="scope.row.status ===5" >{{ scope.row.status === 5 ? '已入库' : '入库' }}</el-button>-->
<!--            </el-popconfirm>-->
<!--          </template>-->





<!--          v-if="scope.row.status===1 || scope.row.status===5"-->
<!--          :disabled="scope.row.status === 5"-->

<!--          <el-popover-->
<!--              placement="top"-->
<!--              width="200"-->
<!--              v-model="visible"-->
<!--          >-->
<!--            <p>请输入入库数量：</p>-->
<!--            <el-input v-model="form1.count" style="margin-bottom: 10px;"></el-input>-->
<!--            <div style="text-align: right; margin: 0">-->
<!--              <el-button size="mini" type="text" @click="visible = false">取消</el-button>-->
<!--              <el-button type="primary" size="mini" @click="inM(scope.row); visible = false">确定</el-button>-->
<!--            </div>-->
<!--            <el-button v-show="scope.row.status===1 || scope.row.status===5" :disabled="scope.row.status === 5" size="mini" slot="reference" type="danger" >{{ scope.row.status === 5 ? '已入库' : '入库' }}</el-button>-->
<!--          </el-popover>-->



<!--          <el-popover-->
<!--              placement="top"-->
<!--              width="160"-->
<!--              v-model="visible"-->
<!--              :ref="'pop' + scope.row.id"-->

<!--          >-->
<!--            <p>这是一段内容这是一段内容确定删除吗？</p>-->
<!--            <div style="text-align: right; margin: 0">-->
<!--              <el-button size="mini" type="text" @click="visible = false">取消</el-button>-->
<!--              <el-button type="primary" size="mini" @click="visible = false">确定</el-button>-->
<!--            </div>-->
<!--            <el-button slot="reference">删除</el-button>-->
<!--          </el-popover>-->
<!--          <el-popover-->
<!--              placement="top"-->
<!--              width="160"-->
<!--              v-model="visible">-->
<!--            <p>这是一段内容这是一段内容确定删除吗？</p>-->
<!--            <div style="text-align: right; margin: 0">-->
<!--              <el-button size="mini" type="text" @click="visible = false">取消</el-button>-->
<!--              <el-button type="primary" size="mini" @click="visible = false">确定</el-button>-->
<!--            </div>-->
<!--            <el-button slot="reference">删除</el-button>-->
<!--          </el-popover>-->






<!--          <el-popconfirm-->
<!--              title="确定同意吗？"-->
<!--              @confirm="approve(scope.row.id)"-->
<!--              style="margin-left: 5px;"-->
<!--          >-->
<!--            <el-button v-if="scope.row.status==0" slot="reference" size="mini" type="success" :disabled="scope.row.status !== 0" >同意</el-button>-->
<!--          </el-popconfirm>-->

<!--          <el-popconfirm-->
<!--              title="确定拒绝吗？"-->
<!--              @confirm="deny(scope.row.id)"-->
<!--              style="margin-left: 5px;"-->
<!--          >-->
<!--            <el-button v-if="scope.row.status==0"  slot="reference" size="mini" type="danger" :disabled="scope.row.status !== 0" >拒绝</el-button>-->
<!--          </el-popconfirm>-->


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
<!--    <el-dialog-->
<!--        title="新增申请"-->
<!--        :visible.sync="dialogVisible"-->
<!--        width="30%">-->
<!--      <el-form ref="form" :rules="rules" :model="form" label-width="80px">-->
<!--        <el-form-item label="药品名" prop="drugName">-->
<!--          <el-select v-model="form.drugName" placeholder="请选择药品名" style="width: 100%;">-->
<!--            <el-option-->
<!--                v-for="drug in drugs"-->
<!--                :key="drug.id"-->
<!--                :label="drug.name"-->
<!--                :value="drug.name">-->
<!--            </el-option>-->
<!--          </el-select>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="数量" prop="quantity">-->
<!--          <el-input v-model="form.quantity"></el-input>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="审批人" prop="approver">-->
<!--          <el-select v-model="form.approver" placeholder="请选择审批人" style="width: 100%;">-->
<!--            <el-option-->
<!--                v-for="user in approvers"-->
<!--                :key="user.id"-->
<!--                :label="user.name"-->
<!--                :value="user.name">-->
<!--            </el-option>-->
<!--          </el-select>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="备注" prop="remarks">-->
<!--          <el-input v-model="form.remarks"></el-input>-->
<!--        </el-form-item>-->

<!--      </el-form>-->
<!--      <span slot="footer" class="dialog-footer">-->
<!--        <el-button @click="dialogVisible = false">取 消</el-button>-->
<!--        <el-button type="primary" @click="save">确 定</el-button>-->
<!--      </span>-->
<!--    </el-dialog>-->
  </div>
</template>
<script>
import axios from 'axios';

export default {
  data() {
    return {

      outDisabled: false,
      inDisabled: false,
      visible: false,
      centerDialogVisible:false,



      applicationList: [],
      dialogVisible: false,
      form: {
        drugName: '',
        quantity: '',
        approver: '',
        remarks: '',
      },

      form1:{
        goods:'',
        goodsname:'',
        count:'',
        username:'',
        userid:'',
        adminId:'',
        remark:'',
        action:'1'
      },

      rules: {
        drugName: [{ required: true, message: '请选择药品名', trigger: 'change' }],
        quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
        approver: [{ required: true, message: '请选择审批人', trigger: 'change' }],
      },
      approver: JSON.parse(sessionStorage.getItem('CurUser')),
      drugs: [],
      approvers: [],

      curMid: '',
      curUid: '',
      curAid: '',

      //分页
      pageSize:10,
      pageNum:1,
      total:0,
    }
  },
  mounted() {
    this.getApplicationList();
    this.getDrugList();
    this.getApproverList();
  },
  methods: {
    openDialog() {
      this.dialogVisible = true;
    },
    // save() {
    //   this.$refs.form.validate(valid => {
    //     if (valid) {
    //       const {drugName, quantity, approver, remarks } = this.form;
    //       axios.post(this.$httpUrl+'/application/save', { myname: this.approver.name, drugName, quantity, approver, remarks})
    //           .then(() => {
    //             this.dialogVisible = false;
    //             this.$message.success('保存成功');
    //             this.getApplicationList(this.approver.name);
    //             this.resetForm();
    //           })
    //           .catch(error => {
    //             console.error(error);
    //             this.$message.error('保存失败');
    //           });
    //     }
    //   });
    // },

    inMed(row){
      this.centerDialogVisible = true
      this.$nextTick(()=>{
        //赋值到表单
        this.form.id = row.id
        this.form.name = row.name
        this.form.storage = row.storage
        this.form.goodstype = row.goodstype
        this.form.count = row.count
        this.form.remark = row.remark
      })
    },


    open(row) {
      this.$prompt('请输入入库数量', '入库', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[0-9]*$/,
        inputErrorMessage: '请输入数字'
      }).then(({ value }) => {
        this.form1.count=value
        // this.$message({
        //   type: 'success',
        //   message: '你的邮箱是: ' + value
        // });
        this.inM(row)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        });
      });
    },


    del(id) {
      this.$confirm('确定删除该申请吗？', '提示', { type: 'warning' })
          .then(() => {
            axios.get(this.$httpUrl+`/application/delete?id=`+id)
                .then(() => {
                  this.$message.success('删除成功');
                  this.getApplicationList();
                })
                .catch(error => {
                  console.error(error);
                  this.$message.error('删除失败');
                });
          })
          .catch(() => {
            // 取消删除
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
          approver: this.approver.name
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
        // this.approvers = response.data;
      })
    },
    getStatusTagType(status) {
      switch (status) {
        case 0:
          return 'info';
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


    // outM1(row){
    //   this.getMid(row.drugName);
    //   console.log("--------------------"+this.curMid);
    //   this.outM2(row);
    // },


    async outM(row){

      // goods:'',
      //     goodsname:'',
      //     count:'',
      //     username:'',
      //     userid:'',
      //     adminId:'',
      //     remark:'',
      //     action:'1'

      await this.getMid(row.drugName);
      await this.getUid(row.myname);
      await this.getAid(row.approver);

      console.log("--------------------"+row.approver);

      this.form1.adminId=this.curAid;
      row.status=4;

      // this.form1.goods=4;
      this.form1.goods=this.curMid;
      console.log("444"+this.curMid);
      this.form1.userid=this.curUid;
      this.form1.count=row.quantity;
      this.form1.action=2;


      this.$axios.put(this.$httpUrl + `/application/update/${row.id}`, {status: 4}).then(res => {
        // 更新成功后，重新获取数据，重新渲染表格
        this.getApplicationList()
      }).catch(err => {
        console.log(err)
      })



      this.$axios.post(this.$httpUrl+'/record/save',this.form1).then(res=>res.data).then(res=>{
        console.log(res)
        if(res.code==200){

          this.$message({
            message: '操作成功！',
            type: 'success'
          });
          this.inDialogVisible = false
          this.getApplicationList()
        }else{
          this.$message({
            message: '操作失败！',
            type: 'error'
          });
        }

      })
    },


    async inM(row){

      // goods:'',
      //     goodsname:'',
      //     count:'',
      //     username:'',
      //     userid:'',
      //     adminId:'',
      //     remark:'',
      //     action:'1'

      await this.getMid(row.drugName);
      await this.getUid(row.myname);
      await this.getAid(row.approver);


      this.form1.adminId=this.curAid;
      this.form1.action=1;


      // this.form1.goods=4;
      this.form1.goods=this.curMid;
      console.log("444"+this.curMid);
      this.form1.userid=this.curUid;
      // this.form1.count=row.quantity;



      this.$axios.put(this.$httpUrl + `/application/update/${row.id}`, {status: 5}).then(res => {
        // 更新成功后，重新获取数据，重新渲染表格
        this.getApplicationList()
      }).catch(err => {
        console.log(err)
      })



      this.$axios.post(this.$httpUrl+'/record/save',this.form1).then(res=>res.data).then(res=>{
        console.log(res)
        if(res.code==200){

          this.$message({
            message: '操作成功！',
            type: 'success'
          });
          this.inDialogVisible = false
          this.getApplicationList()
        }else{
          this.$message({
            message: '操作失败！',
            type: 'error'
          });
        }

      })
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

    approve(id) {
      this.$axios.put(this.$httpUrl + `/application/update/${id}`, {status: 2}).then(res => {
        // 更新成功后，重新获取数据，重新渲染表格
        this.getApplicationList()
      }).catch(err => {
        console.log(err)
      })
    },

    deny(id) {
      this.$axios.put(this.$httpUrl + `/application/update/${id}`, {status: 3}).then(res => {
        // 更新成功后，重新获取数据，重新渲染表格
        this.getApplicationList()
      }).catch(err => {
        console.log(err)
      })
    },


    // getMid(name) {
    //   this.$axios.get(this.$httpUrl + `/goods/getid/${name}`).then(res => {
    //     // 更新成功后，重新获取数据，重新渲染表格
    //     this.curMid=res.data
    //     console.log("12345"+res.data)
    //   }).catch(err => {
    //     console.log(err)
    //   })
    // },

    getMid(name) {
      return new Promise((resolve, reject) => {
        this.$axios.get(this.$httpUrl + `/goods/getid/${name}`).then(res => {
          this.curMid = res.data
          console.log("12345"+res.data)
          resolve()
        }).catch(err => {
          console.log(err)
          reject(err)
        })
      })
    },


    getUid(name) {
      return new Promise((resolve, reject) => {
        this.$axios.get(this.$httpUrl + `/user/getid/${name}`).then(res => {
          this.curUid = res.data
          console.log("abc"+res.data)

          resolve()
        }).catch(err => {
          console.log(err)
          reject(err)
        })
      })
    },


    getAid(name) {
      return new Promise((resolve, reject) => {
        this.$axios.get(this.$httpUrl + `/user/getid/${name}`).then(res => {
          this.curAid = res.data
          console.log("abc"+res.data)

          resolve()
        }).catch(err => {
          console.log(err)
          reject(err)
        })
      })
    },



    getStatusText(status) {
      switch (status) {
        case 0:
          return '待审批';
        case 1:
          return '已归还，未入库';
        case 2:
          return '已批准，未归还'; //未入库
        case 3:
          return '已拒绝';
        case 4:
          return '已批准，未归还'; //已入库
        case 5:
          return '已归还，已入库';//已入库
        default:
          return '';
      }
    },
  },

};
</script>
