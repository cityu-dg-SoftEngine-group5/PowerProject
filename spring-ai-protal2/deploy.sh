#!/bin/bash

# 设置变量
SERVER_IP="101.37.229.131"
SERVER_PASSWORD="Ywd15599"
IMAGE_NAME="ai-pms"
CONTAINER_NAME="ai-pms"
JAR_PATH="/Users/yuan/Desktop/ai_pms-0.0.1-SNAPSHOT.jar"

# 安装 sshpass（如果还没有安装）
if ! command -v sshpass &> /dev/null; then
    echo "Installing sshpass..."
    brew install sshpass
fi

# 构建 Docker 镜像
echo "Building Docker image..."
docker build -t $IMAGE_NAME .

# 保存镜像为 tar 文件
echo "Saving Docker image..."
docker save $IMAGE_NAME > ${IMAGE_NAME}.tar

# 将镜像文件传输到服务器
echo "Transferring image to server..."
sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no ${IMAGE_NAME}.tar root@$SERVER_IP:/root/

# 在服务器上执行部署命令
echo "Deploying on server..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER_IP << 'EOF'
    # 检查 Docker 是否安装
    if ! command -v docker &> /dev/null; then
        echo "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
    fi
    
    # 加载镜像
    docker load < ai-pms.tar
    
    # 停止并删除旧容器（如果存在）
    docker stop ai-pms || true
    docker rm ai-pms || true
    
    # 运行新容器
    docker run -d \
        --name ai-pms \
        -p 8080:8080 \
        --restart unless-stopped \
        ai-pms
    
    # 清理临时文件
    rm ai-pms.tar
EOF

# 清理本地临时文件
rm ${IMAGE_NAME}.tar

echo "Deployment completed!" 