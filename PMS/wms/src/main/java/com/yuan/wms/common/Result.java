package com.yuan.wms.common;

import lombok.Data;

@Data
public class Result {
    private int code;
    private String msg;
    private Long total;
    private Object data;

    public static Result fail(){
        Result result = new Result();
        result.setCode(400);
        result.setMsg("失败");
        result.setTotal(0L);
        result.setData(null);
        return result;
    }

    public static Result success(){
        Result result = new Result();
        result.setCode(200);
        result.setMsg("成功");
        result.setTotal(0L);
        result.setData(null);
        return result;
    }

    public static Result success(Object data){
        Result result = new Result();
        result.setCode(200);
        result.setMsg("成功");
        result.setTotal(0L);
        result.setData(data);
        return result;
    }

    public static Result success(Object data,Long total){
        Result result = new Result();
        result.setCode(200);
        result.setMsg("成功");
        result.setTotal(total);
        result.setData(data);
        return result;
    }

    public static Result result(int code, String msg,Long total, Object data){
        Result result = new Result();
        result.setCode(code);
        result.setMsg(msg);
        result.setTotal(total);
        result.setData(data);
        return result;

    }
}
