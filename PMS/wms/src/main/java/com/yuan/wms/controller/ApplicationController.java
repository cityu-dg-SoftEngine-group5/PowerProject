package com.yuan.wms.controller;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yuan.wms.common.QueryPageParam;
import com.yuan.wms.common.Result;
import com.yuan.wms.entity.Application;
import com.yuan.wms.entity.Goods;
import com.yuan.wms.entity.Record;
import com.yuan.wms.entity.User;
import com.yuan.wms.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;

/**
 * <p>
 *  前端控制器
 * </p>
 *
 * @author wms
 * @since 2023-03-21
 */
@RestController
@RequestMapping("/application")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;



    @PostMapping("/add")
    public Result addApplication(@RequestBody Application application) {
        boolean result = applicationService.save(application);
        return result ? Result.success() : Result.fail();
    }


    @GetMapping("/list")
    public Result getApplicationList() {
        List<Application> applicationDTOList = applicationService.list();
        return Result.success(applicationDTOList);
    }

    @GetMapping("/listByName")
    public Result getApplicationByName(@RequestParam("name") String name) {
        List<Application> applicationList = applicationService.list(new QueryWrapper<Application>().eq("approver", name));
        return Result.success(applicationList);
    }

    @GetMapping("/listByApprover")
    public Result getApplicationByApprover(@RequestParam("name") String name) {
        List<Application> applicationList = applicationService.list(new QueryWrapper<Application>().eq("myname", name));
        return Result.success(applicationList);
    }



    // 新增申请
    @PostMapping("/save")
    public Result save(@RequestBody Application application){
        return applicationService.save(application) ? Result.success() : Result.fail();
    }

    @GetMapping("/delete")
    public Result deleteApplication(@RequestParam("id") Long id) {
        boolean result = applicationService.removeById(id);
        return result ? Result.success() : Result.fail();
    }

    @GetMapping("/deleteByName")
    public Result deleteApplicationByName(@RequestParam("name") String name){
        QueryWrapper query = new QueryWrapper();
        query.eq("myname", name);
        boolean result = applicationService.remove(query);
        return result ? Result.success() : Result.fail();
    }


    @PostMapping("/listPage")
    public Result listPage(@RequestBody QueryPageParam query){
        HashMap param = query.getParam();
        String myname = (String)param.get("myname");
        System.out.println(myname);
        String approver=(String)param.get("approver");


        Page<Application> page = new Page();
        page.setCurrent(query.getPageNum());
        page.setSize(query.getPageSize());

        LambdaQueryWrapper<Application> lambdaQueryWrapper = new LambdaQueryWrapper();
        if(StringUtils.isNotBlank(myname) && !"null".equals(myname)){
            lambdaQueryWrapper.eq(Application::getMyname,myname);
        }

        if(StringUtils.isNotBlank(approver) && !"null".equals(approver)){
            lambdaQueryWrapper.eq(Application::getApprover,approver);
        }



        IPage result = applicationService.pageCC(page,lambdaQueryWrapper);
        return Result.success(result.getRecords(),result.getTotal());
    }

//    @PostMapping("/update")
//    public Result update(@RequestBody Application application){
////        return userService.updateById(user)?Result.success():Result.fail();
//        return applicationService.updateById(application)?Result.success():Result.fail();
//    }


    @PutMapping("/update/{id}")
    public Result updateStatus(@PathVariable("id") Integer id, @RequestBody Application application) {
        application.setId(id);
        applicationService.updateById(application);
        return Result.success();
    }



}
