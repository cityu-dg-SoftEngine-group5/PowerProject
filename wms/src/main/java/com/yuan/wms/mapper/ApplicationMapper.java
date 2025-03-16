package com.yuan.wms.mapper;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Constants;
import com.yuan.wms.entity.Application;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yuan.wms.entity.Goods;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * <p>
 *  Mapper 接口
 * </p>
 *
 * @author wms
 * @since 2023-03-21
 */
@Mapper
public interface ApplicationMapper extends BaseMapper<Application> {
    IPage pageCC(IPage<Application> page, @Param(Constants.WRAPPER) Wrapper wrapper);
}
