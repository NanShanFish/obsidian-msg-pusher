# Obsidian QQPusher Reminder

> [!NOTE] 🔄 **重要说明**：本插件是基于 [Liberniz/obsidian-wxpusher-reminder](https://github.com/Liberniz/obsidian-wxpusher-reminder) 的二次开发版本。


<div align="center">

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Version](https://img.shields.io/badge/Version-0.1.0-blue.svg)](https://github.com/nanshanfish/obsidian-qmsg-reminder)

</div>


差异：将提醒方式从微信推送修改为 QQ消息推送，并增强了任务扫描的灵活性与智能日期解析能力。

一个 Obsidian 插件，用于自动扫描笔记中的待办任务，并在任务到期前通过 QQ 发送提醒。

## 🚀 快速开始

### 安装

1. 在 Obsidian 的「设置」->「社区插件」中，关闭安全模式。
2. 点击「浏览」，搜索「Obsidian QQPusher Reminder」并安装。
3. 在社区插件列表中找到已安装的插件，点击「启用」。

### 配置

1. 获取QQ推送密钥：您需要先配置一个QQ消息推送服务（例如Qmsg酱）。
    - 访问 [官网](https://qmsg.zendee.cn/) 注册并获取您的 API Key（即插件设置中的 appToken）。
    - 在Qmsg酱后台添加您的QQ号作为推送对象，并获取您的 QQ号（即插件设置中的 uid）。
2. 配置插件：在插件设置中填入上述信息，并根据需要调整以下选项：
    - Reminder Days Before Due: 设置提前多少天开始提醒。
    - Daily Scan Time: 设置每天自动扫描任务的时间。
    - Included Folders:  指定要扫描的文件夹路径（如 DailyNotes, Projects/Birthdays），多个路径用英文逗号隔开。留空则扫描整个库。

## 使用方法:

在您的Markdown笔记中，使用以下格式添加任务：
```markdown
- [ ] 准备月度报告 📅 03-15        # 年份默认为今年，时间默认为12:00
- [ ] 项目评审 📅 2025-03-15       # 指定年份，时间默认为12:00
- [ ] 团队会议 📅 03-15 14:30      # 年份默认为今年，指定时间
- [ ] 发布产品 📅 2025-03-15 18:00 # 完整日期时间
```


插件会扫描匹配的任务，并在其到期前通过QQ向您发送提醒。


## 🙏 致谢

由衷感谢 [原插件作者](https://github.com/Liberniz) 的开源工作，为本项目的开发提供了坚实的基础。

如果您觉得这个插件对您有帮助，请给它一个 ⭐️ Star！这是对开发者最大的鼓励。
