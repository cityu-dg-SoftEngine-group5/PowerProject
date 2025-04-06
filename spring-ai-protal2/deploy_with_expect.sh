#!/usr/bin/expect -f

# 设置变量
set SERVER_IP "101.37.229.131"
set SERVER_PASSWORD "Ywd15599"
set IMAGE_NAME "ai-pms"

# 构建 Docker 镜像
puts "Building Docker image..."
exec docker build -t $IMAGE_NAME .

# 保存镜像为 tar 文件
puts "Saving Docker image..."
exec docker save $IMAGE_NAME > ${IMAGE_NAME}.tar

# 将镜像文件传输到服务器
puts "Transferring image to server..."
spawn scp ${IMAGE_NAME}.tar root@$SERVER_IP:/root/
expect {
    "password:" {
        send "$SERVER_PASSWORD\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
}
expect eof

# 在服务器上执行部署命令
puts "Deploying on server..."
spawn ssh root@$SERVER_IP
expect {
    "password:" {
        send "$SERVER_PASSWORD\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
}

# 发送部署命令
send "if ! command -v docker &> /dev/null; then curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh; fi\r"
expect eof

send "docker load < ai-pms.tar\r"
expect eof

send "docker stop ai-pms || true\r"
expect eof

send "docker rm ai-pms || true\r"
expect eof

send "docker run -d --name ai-pms -p 8080:8080 --restart unless-stopped ai-pms\r"
expect eof

send "rm ai-pms.tar\r"
expect eof

send "exit\r"
expect eof

# 清理本地临时文件
exec rm ${IMAGE_NAME}.tar

puts "Deployment completed!" 