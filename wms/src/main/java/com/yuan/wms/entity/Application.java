package com.yuan.wms.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
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
 * @since 2023-03-21
 */
@Data
@EqualsAndHashCode(callSuper = false)
@ApiModel(value="Application对象", description="")
public class Application implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    private String myname;

    @TableField("drug_name")
    private String drugName;

    private String category;

    private Integer quantity;

    private String approver;

    private Integer status;

    private String remarks;





}
