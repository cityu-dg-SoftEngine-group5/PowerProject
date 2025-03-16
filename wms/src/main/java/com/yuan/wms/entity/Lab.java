package com.yuan.wms.entity;

import java.io.Serializable;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * <p>
 * 
 * </p>
 *
 * @author wms
 * @since 2023-06-15
 */
@Data
@EqualsAndHashCode(callSuper = false)
@ApiModel(value="Lab对象", description="")
public class Lab implements Serializable {

    private static final long serialVersionUID = 1L;

    private String lab;


}
