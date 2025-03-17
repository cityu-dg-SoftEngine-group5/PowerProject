package com.yuan.wms.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.yuan.wms.entity.Application;
import com.baomidou.mybatisplus.extension.service.IService;
import com.yuan.wms.entity.Goods;
import org.springframework.stereotype.Service;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author wms
 * @since 2023-03-21
 */
@Service
public interface ApplicationService extends IService<Application> {
    IPage pageCC(IPage<Application> page, Wrapper wrapper);
}
