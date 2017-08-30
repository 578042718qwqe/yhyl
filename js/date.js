/**
 * Created by Administrator on 2017-03-17.
 */

function dataFormate(t){
    return t.getFullYear() + "-"+ (t.getMonth()+1) +"-"+ t.getDate();
}

// 前n个月 n<12
function getPreMonth(date,n) {
    var year = date.getFullYear();
    var day = date.getDate(); // 当前日
    var month = date.getMonth() + 1 - n;
    if (month < 1) {
        year = parseInt(year) - 1;
        month += 12;
    }
    var days = new Date(year, month, 0);
    days = days.getDate(); //n个月前 月天数
    if (day > days) {
        day = days;
    }
    if(day <10){
        day = "0"+day;
    }

    if (month < 10) {
        month = '0' + month;
    }
    var t = year + '-' + month + '-' + day;
    return t;
}
// 后n个月
function getNextMonth(date,n) {
    var arr = date.split('-');
    var year = arr[0]; //获取当前日期的年份
    var month = arr[1]; //获取当前日期的月份
    var day = arr[2]; //获取当前日期的日
    var days = new Date(year, month, 0);
    days = days.getDate(); //获取当前日期中的月的天数
    var year2 = year;
    var month2 = parseInt(month) +n ;
    if (month2 > 12) {
        year2 = parseInt(year2) + 1;
        month2 -=12;
    }
    var day2 = day;
    var days2 = new Date(year2, month2, 0);
    days2 = days2.getDate();
    if (day2 > days2) {
        day2 = days2;
    }
    if (month2 < 10) {
        month2 = '0' + month2;
    }

    var t2 = year2 + '-' + month2 + '-' + day2;
    return t2;
}

