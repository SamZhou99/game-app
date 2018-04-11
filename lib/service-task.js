var CommonData = require('./common-data');
var CommonUtils = require('./common-utils');
var DALFactory = require('./dal-factory');
var CronJob = require("cron").CronJob;

/**
 秒数：Seconds: 0-59
 分钟：Minutes: 0-59
 小时：Hours: 0-23
 月天：Day of Month: 1-31
 月份：Months: 0-11
 星期几：Day of Week: 0-6
 *    *    *    *    *    *
 ┬    ┬    ┬    ┬    ┬    ┬
 │    │    │    │    │    |
 │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
 │    │    │    │    └───── month (1 - 12)
 │    │    │    └────────── day of month (1 - 31)
 │    │    └─────────────── hour (0 - 23)
 │    └──────────────────── minute (0 - 59)
 └───────────────────────── second (0 - 59, OPTIONAL)
 */

//每分钟 01:00 秒时执行
new CronJob({
    cronTime: "00 * * * * *",
    onTick:function () {
        DALFactory.Redis.DeleteGameAndResultData(function (err, result) {
            if(err){
                CommonUtils.Out('任务报错：', err);
                return;
            }
            CommonUtils.Out('Task DeleteGameAndResultData ：OK');
        });
    }
}).start();