/**
 * 原始代码来自: Leibniz/obsidian-wxpusher-reminder (https://github.com/Liberniz/obsidian-wxpusher-reminder)
 * 修改者: nanshanfish
 * 修改内容: 普通消息适配/日期解析优化
 */

var y = Object.defineProperty;
var T = Object.getOwnPropertyDescriptor;
var D = Object.getOwnPropertyNames;
var S = Object.prototype.hasOwnProperty;
var w = (d, r) => {
    for (var s in r) y(d, s, { get: r[s], enumerable: !0 });
};
var W = (d, r, s, t) => {
    if (r && typeof r == "object" || typeof r == "function")
        for (let e of D(r))
    !S.call(d, e) && e !== s && y(d, e, { get: () => r[e], enumerable: !(t = T(r, e)) || t.enumerable });
    return d;
};
var $ = d => W(y({}, "__esModule", { value: !0 }), d);
var N = {};
w(N, { default: () => m });

module.exports = $(N);


// 导入 Obsidian API
var n = require("obsidian");

// 插件默认设置
var R = {
    url: "",
    requestBody: "",
    msg_str: "",
    msg_key: "",
    reminderDays: 7,        // 提前提醒天数（0=当天，1=明天等）
    scanTime: "8:00",       // 每日扫描时间（24小时制）
    includedFolders: "",
    nextScheduledTime: ""
};

var m = class extends n.Plugin {
    async onload() {
        console.log("Loading Pusher Reminder Plugin");
        await this.loadSettings();

        // 添加命令：检查任务并发送提醒
        this.addCommand({
            id: "check-tasks-and-send-reminders",
            name: "Check tasks and send reminders",
            callback: () => {
                this.checkTasksAndSendReminders(true);
            }
        });
        const {TFile, TFolder} = require('obsidian')
        this.TFile = TFile
        this.TFolder = TFolder

        this.addCommand({
            id: "test-pusher-connection",
            name: "Test Pusher Connection",
            callback: () => {
                this.testMsgPusherConnection();
            }
        });


        // 添加设置选项卡
        this.addSettingTab(new x(this.app, this));


        // 布局就绪后启动扫描
        this.app.workspace.onLayoutReady(() => {

            console.log("Obsidian layout ready, checking tasks...");
            this.checkTasksAndSendReminders();
            this.startDailyScanTimer(); // 启动定时扫描
        });
    }


    /**
   * 插件卸载时调用
   */
    async onunload() {
        console.log("Unloading Pusher Reminder Plugin");
    }

    /**
   * 加载插件设置
   */
    async loadSettings() {
        this.settings = Object.assign({}, R, await this.loadData());
    }


    /**
   * 保存插件设置
   */
    async saveSettings() {
        await this.saveData(this.settings);
    }

    /**
   * 测试 Pusher 连接
   */
    async testMsgPusherConnection() {
        console.log("Testing Pusher connection...");
        let { url: u, msg_key: k, msg_str: s, requestBody: rb } = this.settings

        // 检查配置是否完整
        if (!u || !rb || !k || !s) {
            new n.Notice("Pusher url/requestBody/msg key/str not set");
            console.log("Pusher url or requestBody is missing for test.");
            return;
        }

        new n.Notice("Sending test message via Pusher...");
        let e = "This is a test message from the Obsidian Msg Pusher plugin.";
        await this.sendMsg(u, k, s, rb, e, !0);
    }

    async checkTasksAndSendReminders(force) {
        let { url: u, msg_key: k, msg_str: s, requestBody: rb, reminderDays: e, includedFolders: includedFoldersSetting, nextScheduledTime: last_next_time_str } = this.settings;

        if (!u || !rb || !k || !s) {
            console.log("Pusher url/requestBody/msg key/str not set");
            return;
        }

        // 1. 准备时间范围
        const [next_scheduled_time, o] = this.getNextScheduledTime();
        const last_next_time = new Date(last_next_time_str)
        if (last_next_time > o && !force) {
            console.log("未到触发时间, 已停止")
            return
        }

        const now = moment(o)
        const startDate = now.startOf('day');
        const endDate = now.clone().add(e, 'days').endOf('day');

        let taskCount = 0;
        let tasksDueSoon = [];

        // 用于匹配任务的正则表达式
        const taskRegex = /-\s*\[ \]\s*📅 (\d{4}-)?(\d+-\d+)\s*(\d+:\d+)?\s*(.*?)\s*/g;

        // 2. 核心优化：处理用户配置的文件夹
        if (includedFoldersSetting && includedFoldersSetting.trim() !== '') {
            const folderPaths = includedFoldersSetting.split(',').map(path => path.trim());

            for (const folderPath of folderPaths) {
                try {
                    // 使用 getAbstractFileByPath 获取文件对象
                    const fileOrFolder = this.app.vault.getAbstractFileByPath(folderPath);

                    if (!fileOrFolder) {
                        console.warn(`Path not found: ${folderPath}`);
                        continue;
                    }


                    let filesToScan = [];


                    // 判断获取到的是单个文件还是文件夹
                    if (fileOrFolder instanceof this.TFile) {
                        // 如果是单个文件，直接加入扫描列表
                        filesToScan.push(fileOrFolder);
                    } else if (fileOrFolder instanceof this.TFolder) {
                        // 如果是文件夹，递归获取其下所有.md文件
                        filesToScan = this.getAllMarkdownFilesInFolder(fileOrFolder);
                    } else {
                        console.warn(`Unsupported type at path: ${folderPath}`);
                        continue;
                    }


                    // 3. 扫描找到的文件
                    for (const file of filesToScan) {

                        const tasksInFile = await this.scanFileForTasks(file, taskRegex, startDate, endDate);
                        tasksDueSoon.push(...tasksInFile);
                        taskCount += tasksInFile.length;
                    }


                } catch (error) {
                    console.error(`Error processing path '${folderPath}':`, error);
                }
            }
        } else {
            // 如果未配置包含文件夹，回退到原来的行为（扫描整个仓库）
            console.log("No included folders configured, scanning all markdown files.");
            const allMarkdownFiles = this.app.vault.getMarkdownFiles();
            for (const file of allMarkdownFiles) {
                const tasksInFile = await this.scanFileForTasks(file, taskRegex, startDate, endDate);
                tasksDueSoon.push(...tasksInFile);
                taskCount += tasksInFile.length;
            }
        }

        console.log(`Found ${taskCount} tasks due within the next ${e} days.`);
        if (tasksDueSoon.length > 0) {
            tasksDueSoon.sort((a,b) => a.dueDate - b.dueDate);
            let messageContent = `You have ${tasksDueSoon.length} task(s) due soon:\n\n`;

            tasksDueSoon.forEach(task => {
                var daysDiff = task.dueDate.diff(startDate, 'days');
                if (daysDiff === 0) {
                    daysDiff = '今天'
                } else if (daysDiff === 1) {
                    daysDiff = '明天'
                } else if (daysDiff === 2) {
                    daysDiff = '后天'
                } else {
                    daysDiff = daysDiff + '天后'
                }

                messageContent += `- 📅 ${daysDiff} ${task.dueDate.format("HH:mm")} ${task.description}\n`;
            });

            await this.sendMsg(u,k,s,rb, messageContent.trim());
        }
        this.settings.nextScheduledTime = next_scheduled_time.toISOString();
        this.saveSettings();
    }


    /**
 * 辅助函数：递归获取文件夹内所有Markdown文件
 * @param {TFolder} folder - 要扫描的文件夹
 * @returns {TFile[]} 该文件夹及其子文件夹下的所有.md文件
 */
    getAllMarkdownFilesInFolder(folder) {
        let markdownFiles = [];
        for (const child of folder.children) {
            if (child instanceof this.TFile && child.extension === 'md') {
                markdownFiles.push(child);

            } else if (child instanceof this.TFolder) {
                // 递归扫描子文件夹
                markdownFiles.push(...this.getAllMarkdownFilesInFolder(child));
            }
        }
        return markdownFiles;
    }

    /**
 * 辅助函数：扫描单个文件中的任务
 * @param {TFile} file - 要扫描的文件
 * @param {RegExp} taskRegex - 用于匹配任务的正则表达式
 * @param {Moment} startDate - 提醒时间范围的开始日期
 * @param {Moment} endDate - 提醒时间范围的结束日期
 * @returns {Array} 找到的到期任务列表
 */
    async scanFileForTasks(file, taskRegex, startDate, endDate) {
        const tasksFound = [];
        try {
            const fileContent = await this.app.vault.cachedRead(file);
            let match;
            taskRegex.lastIndex = 0; // 重置正则表达式状态

            while ((match = taskRegex.exec(fileContent)) !== null) {
                const taskDescription = match[4].trim();


                const fulldateStr = match[1] ? match[1] + match[2] : moment().year() + "-" + match[2];
                const timeStr = match[3] || "12:00";
                const dueDateMoment = moment(fulldateStr + " " + timeStr, "YYYY-MM-DD HH:mm")

                if (!dueDateMoment || !dueDateMoment.isValid()) {
                    console.warn(`Invalid date format: ${fulldateStr + " " + timeStr} in file ${file.path}`);
                    continue; // 跳过无效日期格式
                }

                // 检查任务是否在指定的时间范围内
                if (dueDateMoment.isBetween(startDate, endDate, null, '[]')) {
                    tasksFound.push({
                        description: taskDescription,
                        dueDate: dueDateMoment,
                        file: file
                    });
                }
            }
        } catch (error) {
            console.error(`Error reading or processing file ${file.path}:`, error);
        }
        return tasksFound;
    }
    /**
   * 发送 Pusher 通知
   * @param {string} url - 请求的url
   * @param {string} rbody - 请求体
   * @param {string} e - 消息内容
   * @param {boolean} i - 是否为测试消息
   */
    async sendMsg(url, msg_key, msg_string, rbody, e, i = !1) {

        let parsedBody;
        try {
            parsedBody = JSON.parse(rbody);
        } catch (error) {
            new n.Notice("Failed to parse requestBody as JSON");
            console.warn("Failed to parse requestBody as JSON:", error);
            return
        }

        parsedBody[msg_key] = msg_string.replace(/{msg}/g, e);
        console.log("Final Request Payload:", parsedBody);

        try {
            let a = await (0, n.requestUrl)({
                url: url,
                method: "POST",
                contentType: "application/json",
                body: JSON.stringify(parsedBody)
            });

            console.log("Pusher API Response Body:", a.text);

            let l = a.json;

            // 检查响应状态
            if (a.status === 200 && l && l.code === 0) {
                new n.Notice(`Pusher ${i ? "test " : ""}message sent successfully!`);
                console.log(`Pusher ${i ? "test " : ""}message sent successfully!`);
            } else {
                let c = l ? l.msg : "Unknown error";

                new n.Notice(`Failed to send Pusher ${i ? "test " : ""}message: ${c}`);
                console.error(`Failed to send Pusher ${i ? "test " : ""}message:`, c, a.text);
            }
        } catch (a) {
            new n.Notice(`Error sending Pusher ${i ? "test " : ""}message. Check console for details.`);
            console.error(`Error sending Pusher ${i ? "test " : ""}message:`, a);
        }
    }

    getNextScheduledTime() {
        let { scanTime: s } = this.settings;
        // 解析扫描时间（小时和分钟）
        let [t, e] = s.split(":").map(Number);
        let o = new Date();
        let i = new Date();

        // 设置今天的扫描时间
        i.setHours(t, e, 0, 0);

        // 如果今天的时间已过，设置为明天
        if (i <= o) {
            i.setDate(i.getDate() + 1);
        }
        return [ i,o ]
    }

    /**
   * 启动每日定时扫描
   * 根据设置中的扫描时间安排定时任务
   */
    startDailyScanTimer() {
        let [i,o] = this.getNextScheduledTime()
        // 计算距离下次扫描的毫秒数
        let u = i.getTime() - o.getTime();

        // 设置定时器
        setTimeout(() => {
            this.checkTasksAndSendReminders();
            // 设置每日间隔扫描（24小时）
            setInterval(() => {
                this.checkTasksAndSendReminders();
            }, 24 * 60 * 60 * 1000);
        }, u);

        console.log(`Next task scan scheduled for ${i.toLocaleString()}`);
    }
};

// 插件设置选项卡类 [3](@ref)
var x = class extends n.PluginSettingTab {
    constructor(s, t) {
        super(s, t);
        this.plugin = t;
    }

    /**
   * 显示设置界面
   */
    display() {
        let { containerEl: s } = this;
        s.empty();

        // 创建设置标题
        s.createEl("h2", { text: "Pusher Reminder Settings" });

        // url
        new n.Setting(s)
            .setName("Pusher URL")
            .setDesc("Your Pusher application url.")
            .addText(t => t
                .setPlaceholder("Enter your request API")
                .setValue(this.plugin.settings.url)
                .onChange(async e => {
                    this.plugin.settings.url = e;
                    await this.plugin.saveSettings();
                }));

        // Pusher RequestBody Setting
        new n.Setting(s)
            .setName("Request Body")
            .setDesc("check your api docs")
            .addTextArea(t => t
                .setPlaceholder("e.g., { \"format\": \"xxx\", \"other_setting\": \"xxx\"}\" }")
                .setValue(this.plugin.settings.requestBody)
                .onChange(async e => {
                    this.plugin.settings.requestBody = e;
                    await this.plugin.saveSettings();
                }));

        new n.Setting(s)
            .setName("Msg key")
            .addTextArea(t => t
                .setPlaceholder("e.g., msg")
                .setValue(this.plugin.settings.msg_key)
                .onChange(async e => {
                    this.plugin.settings.msg_key = e;
                    await this.plugin.saveSettings();
                }));

        new n.Setting(s)
            .setName("Msg format string")
            .setDesc("use {msg} as msg placeholder")
            .addTextArea(t => t
                .setPlaceholder("e.g., {msg}")
                .setValue(this.plugin.settings.msg_str)
                .onChange(async e => {
                    this.plugin.settings.msg_str = e;
                    await this.plugin.saveSettings();
                }));
        // 提醒天数设置
        new n.Setting(s)
            .setName("Reminder Days Before Due")
            .setDesc("Number of days before the due date to send a reminder (e.g., 1 for tomorrow, 0 for today).")
            .addText(t => t
                .setPlaceholder("e.g., 1")
                .setValue(String(this.plugin.settings.reminderDays))
                .onChange(async e => {
                    let o = parseInt(e);

                    if (!isNaN(o) && o >= 0) {
                        this.plugin.settings.reminderDays = o;

                        await this.plugin.saveSettings();
                    } else {
                        new n.Notice("Please enter a valid non-negative number for reminder days.");
                    }
                }));

        // 每日扫描时间设置
        new n.Setting(s)
            .setName("Daily Scan Time")
            .setDesc("Time to scan tasks daily (24-hour format, e.g., 14:00 for 2 PM).")
            .addText(t => t
                .setPlaceholder("e.g., 8:00")
                .setValue(this.plugin.settings.scanTime)
                .onChange(async e => {
                    // 验证时间格式（HH:MM）
                    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(e)) {
                        this.plugin.settings.scanTime = e;
                        await this.plugin.saveSettings();
                        this.plugin.startDailyScanTimer(); // 重新启动定时器
                    } else {
                        new n.Notice("Please enter a valid time in 24-hour format (HH:MM).");
                    }
                }));
        new n.Setting(s)
            .setName("Included Folders/File")
            .setDesc("指定要扫描的文件夹路径（相对于库根目录），多个路径请用英文逗号分隔。例如：DailyNotes,Projects/Meetings。留空则扫描整个库。")
            .addText(t => t
                .setPlaceholder("e.g., Todos")
                .setValue(this.plugin.settings.includedFolders)
                .onChange(async e => {
                    this.plugin.settings.includedFolders = e;
                    await this.plugin.saveSettings();
                }));
    }
};
