# game-app
#### NodeJs项目模板
======================
- 1.web 进程
- 2.socket.io 进程
- 3.mysql(数据存储) + redis(消息同步与分布式消息列队) session根据业务存储到redis中或mysql
- 4.pm2 进程管理

1. 下载项目先安装所需模块npm install
2. 配置config-web.js
3. 安装pm2，运行命令行：pm2 start config-pm2.json
