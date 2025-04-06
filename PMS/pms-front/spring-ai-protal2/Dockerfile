# 使用 OpenJDK 17 作为基础镜像
FROM openjdk:17-jdk-slim

# 设置工作目录
WORKDIR /app

# 复制 jar 文件到容器中
COPY ai_pms-0.0.1-SNAPSHOT.jar app.jar

# 暴露应用端口（假设应用使用 8080 端口）
EXPOSE 8080

# 设置时区为上海
ENV TZ=Asia/Shanghai

# 启动命令
ENTRYPOINT ["java", "-jar", "app.jar"] 