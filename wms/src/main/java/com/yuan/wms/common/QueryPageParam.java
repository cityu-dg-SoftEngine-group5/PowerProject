package com.yuan.wms.common;

import lombok.Data;

import java.util.HashMap;

@Data
public class QueryPageParam {
    private static int PAGE_SIZE=20;
    private static int PAGE_NUM=1;

    private int pageSize;
    private int pageNum;

    private HashMap param= new HashMap();
}
