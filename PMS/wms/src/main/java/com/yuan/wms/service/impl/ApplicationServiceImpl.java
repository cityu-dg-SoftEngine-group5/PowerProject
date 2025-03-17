package com.yuan.wms.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.yuan.wms.entity.Application;
import com.yuan.wms.entity.Goods;
import com.yuan.wms.mapper.ApplicationMapper;
import com.yuan.wms.mapper.GoodsMapper;
import com.yuan.wms.service.ApplicationService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author wms
 * @since 2023-03-21
 */
@Service
public class ApplicationServiceImpl extends ServiceImpl<ApplicationMapper, Application> implements ApplicationService {
    @Resource
    private ApplicationMapper ApplicationsMapper;
    @Override
    public IPage pageCC(IPage<Application> page, Wrapper wrapper) {
        return ApplicationsMapper.pageCC(page,wrapper);
    }
}
