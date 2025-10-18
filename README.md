# Obsidian QQPusher Reminder

> [!NOTE] 🔄 **重要说明**：本插件是基于 [Liberniz/obsidian-wxpusher-reminder](https://github.com/Liberniz/obsidian-wxpusher-reminder) 的二次开发版本。


<div align="center">

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Version](https://img.shields.io/badge/Version-0.1.0-blue.svg)](https://github.com/nanshanfish/obsidian-qmsg-reminder)

</div>

一个专为 Obsidian 设计的智能任务提醒插件，可自动扫描笔记中的待办事项，并在任务到期前通过可配置的通用消息接口（如 QQ 推送、Server 酱、WxPusher 等）向您发送提醒。


## ✨ 特性

| 特性 | 描述 |

| :--- | :--- |
| **通用消息接口** | 支持通过配置 URL 和 JSON 请求体，适配多种消息推送服务（Qmsg 酱、Server 酱、WxPusher 等）。 |
| **智能日期解析** | 增强的日期解析能力，支持多种日期时间格式（如 `03-15`, `2025-03-15`, `03-15 14:30`）。 |
| **精准任务扫描** | 可指定扫描特定文件夹或文件，支持递归扫描子目录，避免全库扫描的资源浪费。 |
| **灵活提醒周期** | 用户可自定义提前提醒的天数以及每日自动扫描的时间点。 |
| **安全与隐私** | 所有配置和任务数据均存储在本地，不与第三方共享。 |

## 🚀 快速开始

### 环境要求

- Obsidian 版本 ≥ 1.4.0 

### 安装步骤

1. 克隆项目 `git clone https://github.com/NanShanFish/obsidian-msg-pusher.git`
2. 复制文件夹到仓库根目录下的 `.obsidian/plugins` 文件夹下
3. 在设置里启用
4. 配置参数


### 基本配置

#### 1. 获取推送服务的密钥
插件通过 HTTP API 与消息推送服务通信。您需要根据所选的服务（如 Qmsg 酱、Server 酱）进行注册和配置，以获取必要的认证信息（如 `appToken` 或 `SendKey`）。

#### 2. 配置插件设置
在 Obsidian 中，进入 `设置` -> `QQPusher Reminder Settings`，填写以下核心配置：


- **Pusher URL**：填入您所用消息推送服务的 API 端点 URL。
- **Request Body**：填写符合该服务 API 要求的 JSON 请求体模板，使用 `{msg}` 作为消息内容的占位符。
- **Msg key**：在请求体 JSON 中，用于存放最终消息文本的字段名（例如 `"msg"`）。
- **Msg format string**：定义消息内容的格式，使用 `{msg}` 作为插件生成的任务提醒内容的占位符（通常直接填写 `{msg}` 即可）。
- **Reminder Days Before Due**：设置提前多少天开始提醒（例如，`1` 表示提前一天）。
- **Daily Scan Time**：设置每天自动扫描任务的时间（24小时制，如 `08:00`）。
- **Included Folders/Files**：指定要扫描的文件夹或文件路径（相对于库根目录），多个路径用英文逗号隔开。留空则扫描整个库。

## 💡 使用方法

在您的 Markdown 笔记中，使用特定的语法格式来添加可被识别的任务。


### 任务格式语法

插件会扫描以下格式的未完成任务项：
```markdown

- [ ] 任务描述 📅 YYYY-MM-DD HH:mm
- [ ] 任务描述 📅 MM-DD HH:mm
- [ ] 任务描述 📅 YYYY-MM-DD
- [ ] 任务描述 📅 MM-DD
```
**日期说明**：
- **年份（YYYY）**：如果省略，则默认为当前年份。
- **时间（HH:mm）**：如果省略，则默认为 `12:00`。


### 配置示例


以下是一个针对 **Qmsg酱** 的配置示例，帮助您理解如何填写设置：


- **Pusher URL**: `https://qmsg.zendee.cn/send/您的Qmsg酱SendKey`

- **Request Body**:
```json
{
    "qq": "你的QQ号码"
}
```
- **Msg key**: `msg`
- **Msg format string**: `{msg}`


### 故障排除 

如果消息推送失败，请按以下步骤检查：

1.  **检查配置**：确认 URL、请求体、Msg Key 和 Msg Format String 填写正确，特别是 JSON 格式要准确。
2.  **查看日志**：打开 Obsidian 的开发者控制台（Ctrl+Shift+I），查看插件打印的日志信息，这通常是定位问题的关键。
3.  **验证服务端**：确保您使用的消息推送服务本身工作正常，有时可能是服务方临时故障或维护。
4.  **网络连接**：确认您的网络环境可以正常访问配置中的 API URL。

## 🙏 致谢

由衷感谢原插件作者 [Liberniz](https://github.com/Liberniz) 的开源工作，为本项目的开发提供了坚实的基础。


## 📜 开源协议


本项目基于 GPL v3 开源协议发布。详见 [GPL v3](https://www.gnu.org/licenses/gpl-3.0) 文件。


如果您觉得这个插件对您有帮助，请给它一个 ⭐️ Star！这是对开发者最大的鼓励。
