package com.yuan.wms.common;

import com.yuan.wms.entity.User;
import org.apache.poi.ss.usermodel.*;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Component
public class ExcelUtils {
    public List<User> importUsersFromExcel(MultipartFile file) throws IOException {
        List<User> users = new ArrayList<>();
        Workbook workbook = WorkbookFactory.create(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);
        Iterator<Row> rowIterator = sheet.rowIterator();
        // 第一行通常是标题，跳过
        if (rowIterator.hasNext()) {
            rowIterator.next();
        }
        while (rowIterator.hasNext()) {
            Row row = rowIterator.next();
            User user = new User();
            Cell cell = row.getCell(1);

            user.setNo(cell.getStringCellValue());
            cell = row.getCell(2);

            System.out.println(cell.getStringCellValue());

            user.setName(cell.getStringCellValue());
            cell = row.getCell(3);


            user.setPassword(String.valueOf((int)cell.getNumericCellValue()));
            cell = row.getCell(4);


            user.setAge((int)cell.getNumericCellValue());
            cell = row.getCell(5);
            user.setSex((int)cell.getNumericCellValue());
            cell = row.getCell(6);

            user.setPhone(new BigDecimal(cell.getNumericCellValue()).toString());

            cell = row.getCell(7);

            user.setRoleId((int)cell.getNumericCellValue());
            users.add(user);
        }
        workbook.close();
        return users;
    }
}
