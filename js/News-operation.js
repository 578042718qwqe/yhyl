/**
 * Created by wuzebo on 2017/8/29.
 */
$(".news-operation-all-right-bottm ul li").eq(0).show();
$(".news-operation-all-right-top ul li").eq(0).addClass("on");
$(".news-operation-all-right-top ul li").bind("click",function () {
    var index =$(this).index();
    $(".news-operation-all-right-bottm ul li").eq(index).show().siblings().hide();
    $(this).addClass("on").siblings().removeClass("on");
});
$(".btn-bc").bind("click",function () {
    $.ajax({
        type: "post",
        url: "/apis/sys/workingMesManagement/addSysWorkingMessagePlan",
        success: function(date){
            console.log(date)
        }
    });
});
$.ajax({
    type: "get",
    url: "/apis/sys/workingMesManagement/getSysWorkingMessagePlanList",
    success: function(date){

    }
});
function seach(a,b) {
    $.getJSON("/apis/sys/workingMesManagement/getSysWorkingMessagePlanList?flag="+a+"&exeFlag="+b,function(date){
        date.data.forEach(function(item){
            var Type = (item.workingType == 1)?"主动执行":"被动执行";
            if(item.sendWay ==1 ){ var SendWay ="短信" }else if(item.sendWay ==2 ){ var SendWay ="微信" }else { var SendWay ="无微信则短信" }
            if(item.receiveIfself ==1 ){ var ReceiveIfself ="本人" }else if(item.receiveIfself ==2 ){ var ReceiveIfself ="联系人" }else { var ReceiveIfself ="无本人则联系人" }
            if(item.flag ==1 ){ var Flag ="正常" }else if(item.flag ==2 ){ var Flag ="暂停" }else { var Flag ="删除" }
            if(item.execFlag ==1 ){ var ExecFlag ="待执行" }else if(item.execFlag ==2 ){ var ExecFlag ="正在执行" }else { var ExecFlag ="执行完成" }
            var ReceivePerpons = [];
            item.receivePerpons.split("，").forEach(function (e) {
                    if(e ==0){
                        Perpons="编辑人员查询脚本"
                    }else if(e ==1){
                        Perpons="所有人"
                    }else if(e ==2){
                        Perpons="一般人群"
                    }else if(e ==3){
                        Perpons="高血压"
                    }else if(e ==4){
                        Perpons="糖尿病"
                    }else if(e ==5){
                        Perpons="儿童"
                    }
                    ReceivePerpons.push(Perpons);
                }
            );
            var pOption = "<tr workID='"+item.id+"'>"+"<td>"+item.code+"</td>"+"<td>"+item.workingName+"</td>"+"<td>"+Type+"</td>"+"<td>"+ReceivePerpons+"</td>"+"<td>"+SendWay+"</td>"+"<td>"+ReceiveIfself+"</td>"+"<td>"+Flag+"</td>"+"<td>"+ExecFlag+"</td>"+"</tr>";
            $("#test-table").append(pOption);
        });
    });
}
seach(-1,-1);
$("#Jobstatus,#Execution").change(function () {
    $("#test-table tbody").empty();
    seach($("#Jobstatus").val(),$("#Execution").val());
    console.log($("#Jobstatus").val(),$("#Execution").val())
});
$("body").on("click","table tr",function () {
    alert($(this).attr("workID"))
});