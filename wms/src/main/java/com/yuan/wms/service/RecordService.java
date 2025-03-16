package com.yuan.wms.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.yuan.wms.entity.Record;
import com.baomidou.mybatisplus.extension.service.IService;
import org.springframework.stereotype.Service;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author wms
 * @since 2023-03-20
 */
@Service
public interface RecordService extends IService<Record> {
    IPage pageCC(IPage<Record> page, Wrapper wrapper);
}
