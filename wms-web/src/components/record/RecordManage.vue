<template>
    <div>
        <div style="margin-bottom: 5px;">
            <el-input v-model="name" placeholder="请输入药品名" suffix-icon="el-icon-search" style="width: 200px;"
                      @keyup.enter.native="loadPost"></el-input>
            <el-select v-model="storage" placeholder="请选择药柜" style="margin-left: 5px;">
                <el-option
                        v-for="item in storageData"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id">
                </el-option>
            </el-select>
            <el-select v-model="goodstype" placeholder="请选择分类" style="margin-left: 5px;">
                <el-option
                        v-for="item in goodstypeData"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id">
                </el-option>
            </el-select>

            <el-button type="primary" style="margin-left: 5px;" @click="loadPost">查询</el-button>
            <el-button type="success" @click="resetParam">重置</el-button>
          <el-button type="primary" style="margin-left: 5px;" @click="exportExcel">导出</el-button>



        </div>
        <el-table id="exportTab"
            :data="tableData"
                  :header-cell-style="{ background: '#f2f5fc', color: '#555555' }"
                  border
        >
<!--            <el-table-column prop="id" label="ID" width="60">-->
<!--            </el-table-column>-->
          <el-table-column label="ID" width="60">
            <template slot-scope="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
            <el-table-column prop="goodsname" label="药品名" width="180">
            </el-table-column>
            <el-table-column prop="storagename" label="药柜" width="180">
            </el-table-column>
            <el-table-column prop="goodstypename" label="分类" width="180">
            </el-table-column>
            <el-table-column prop="adminname" label="操作人" width="180">
            </el-table-column>
            <el-table-column prop="username" label="申请人" width="180">
            </el-table-column>
            <el-table-column prop="count" label="数量" width="180">
            </el-table-column>
            <el-table-column prop="createtime" label="操作时间" width="180" sortable>
            </el-table-column>
            <el-table-column prop="remark" label="备注">
            </el-table-column>
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
    </div>
</template>

<script>
    import FileSaver from 'file-saver';
    import XLSX from 'xlsx';


    export default {
        name: "RecordManage",

        data() {

            return {
                user : JSON.parse(sessionStorage.getItem('CurUser')),
                storageData:[],
                goodstypeData:[],
                tableData: [],
                pageSize:10,
                pageNum:1,
                total:0,
                name:'',
                storage:'',
                goodstype:'',
                centerDialogVisible:false,
                form:{
                    id:'',
                    name:'',
                    storage:'',
                    goodstype:'',
                    count:'',
                    remark:''
                },
            }
        },
        methods:{



            formatStorage(row){
                let temp =  this.storageData.find(item=>{
                    return item.id == row.storage
                })

                return temp && temp.name
            },
            formatGoodstype(row){
                let temp =  this.goodstypeData.find(item=>{
                    return item.id == row.goodstype
                })

                return temp && temp.name
            },
            resetForm() {
                this.$refs.form.resetFields();
            },
            handleSizeChange(val) {
                console.log(`每页 ${val} 条`);
                this.pageNum=1
                this.pageSize=val
                this.loadPost()
            },
            handleCurrentChange(val) {
                console.log(`当前页: ${val}`);
                this.pageNum=val
                this.loadPost()
            },
            resetParam(){
                this.name=''
                this.storage=''
                this.goodstype=''
            },
          exportExcel() {
            /* generate workbook object from table */
            var XLSX = require('xlsx');
            XLSX = XLSX && XLSX.hasOwnProperty('default') ? XLSX['default'] : XLSX;

            var xlsxParam = { raw: true } // 导出的内容只做解析，不进行格式转换
            var wb = XLSX.utils.table_to_book(document.querySelector('#exportTab'), xlsxParam)

            /* get binary string as output */
            var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' })
            try {
              FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '记录表.xlsx')
            } catch (e) {
              if (typeof console !== 'undefined') {
                console.log(e, wbout)
              }
            }
            return wbout
          },






          loadStorage(){
                this.$axios.get(this.$httpUrl+'/storage/list').then(res=>res.data).then(res=>{
                    console.log(res)
                    if(res.code==200){
                        this.storageData=res.data
                    }else{
                        alert('获取数据失败')
                    }

                })
            },
            loadGoodstype(){
                this.$axios.get(this.$httpUrl+'/goodstype/list').then(res=>res.data).then(res=>{
                    console.log(res)
                    if(res.code==200){
                        this.goodstypeData=res.data
                    }else{
                        alert('获取数据失败')
                    }

                })
            },
            loadPost(){
                this.$axios.post(this.$httpUrl+'/record/listPage',{
                    pageSize:this.pageSize,
                    pageNum:this.pageNum,
                    param:{
                        name:this.name,
                        goodstype:this.goodstype+'',
                        storage:this.storage+'',
                        roleId:this.user.roleId+'',
                        userId:this.user.id+''
                    }
                }).then(res=>res.data).then(res=>{
                    console.log(res)
                    if(res.code==200){
                        this.tableData=res.data
                        this.total=res.total
                    }else{
                        alert('获取数据失败')
                    }

                })
            },
        },
        beforeMount() {
            this.loadStorage()
            this.loadGoodstype()
            this.loadPost()

        },
    }
</script>

<style scoped>

</style>