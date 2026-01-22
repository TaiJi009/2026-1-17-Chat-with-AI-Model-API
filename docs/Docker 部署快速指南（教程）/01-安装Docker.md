# 01-安装Docker

## 步骤说明

这是快速开始的第一步：安装 Docker。

## Windows/Mac

1. 访问 [Docker Desktop 官网](https://www.docker.com/products/docker-desktop/)
2. 下载对应操作系统的安装包
3. 运行安装程序并按照提示完成安装
4. 安装完成后启动 Docker Desktop
5. 等待 Docker Desktop 完全启动（系统托盘图标不再转动）

## Linux

在 Linux 系统上安装 Docker Engine：

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

安装完成后，需要重新登录或执行以下命令使权限生效：

```bash
newgrp docker
```

验证安装：

```bash
docker --version
docker-compose --version
```

## 下一步

安装完成后，继续下一步：[02-配置环境变量](./02-配置环境变量.md)
