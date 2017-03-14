/*
（by 骆杨）

func=tongji_mingxi
账号=1000032
随机码=315153acd46e714482ef353a7220d06d
月份=12
年份=2016
手机ID=123123
手机名称=112312323
手机型号=231123

更新时间=2016-11-22
更新人=骆杨
更新原因=新的需求

更新人=梁敏俐
更新时间=2016-12-20
更新内容=多传了交易金额和到账金额给安卓开发和ios开发
版本=1.1.1

修改时间：2017-02-03
修改人：梁敏俐
修改原因：更换接口到新平台
版本=v1.2.1

*/


var mongo = require('../func/mongo.js');
var pgdb = require('../func/pgdb.js');
var common = require('../func/common.js');
var moment = require("moment");
var share = require('./public/share.js');
//公用模块

module.exports.run = function(body,pg,mo){
		var data = {};
		var f={};
		
		//body.receive = JSON.parse(body.data);
		f=body.receive;
		f.时间=moment().format('YYYY-MM-DD HH:mm:ss');
		data.状态 = '成功';
		
			if(f.月份 == null || f.月份 == ''){
				data.状态 = '月份不能为空';
			}else if(f.年份 == null || f.年份 == ''){
				data.状态 = '年份不能为空';
			}
			if(Number(f.月份) < 10){
				f.月份 = "0"+f.月份;
			}
			if(data.状态!='成功'){
				return data;
			}

        /*公用头部*/
        f.top = share.top(f.账号, f.随机码, pg);
        if(f.top.状态 != '成功') {
            data.状态=f.top.状态;
            return data;
        }else{
            f.会=f.top.会;
        }
			var sql0 = "select 油站id from 油_会员表 where 账号 = '"+f.账号+"'";
			var result0 = pgdb.query(pg,sql0).数据[0];
			if(result0 == null || result0 == ''){
				data.状态 = '无此账号信息';
				return data;
			}
			
			var sql1 = "select a.id,a.交易单号,Round(a.积分,2) as 到账金额,a.录入时间,a.状态 ,Round(b.金额,2) as 交易金额,a.类别,b.油品型号,x.市场价   from 油_账户表  a,油_油站交易记录表  b,油_油品信息表 x  where a.油站id='"+result0.油站id+"' and a.交易单号 = b.商品订单号   and a.类别 = '代付' and x.油品型号 = b.油品名称  and a.油站id = x.油站id and substring(a.录入时间,6,2) = '"+f.月份+"' and substring(a.录入时间,0,5) = '"+f.年份+"' and b.类别 = '加油' and a.状态 = '已支付' and b.状态 = '已支付' order by 录入时间 desc";
			var result1 = pgdb.query(pg,sql1).数据;
			//console.log(sql1);
			if(result1 == null || result1 == ''){
				data.列表 = '';
				data.条数 = 0;
			}else{
				data.列表 = result1;
				data.条数 = result1.length;
			}
			return data;
}

/*输出
{
    "状态": "成功",
    "列表": [
        {
            "id": "717",
            "交易单号": "13201612291805411000008",
            "到账金额": "9.20",
            "录入时间": "2016-12-29 18:05:50",
            "状态": "已支付",
            "交易金额": "10.00",
            "类别": "代付",
            "油品型号": "97#",
            "市场价": "25.00"
        },
        {
            "id": "195",
            "交易单号": "13201612011134211100008",
            "到账金额": "4.42",
            "录入时间": "2016-12-01 11:34:32",
            "状态": "已支付",
            "交易金额": "5.00",
            "类别": "代付",
            "油品型号": "95#",
            "市场价": "6.00"
        }
    ],
    "条数": 2,
    "Time": 1176
}*/

