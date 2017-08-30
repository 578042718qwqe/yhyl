/**
 * Created by 新建文档信息 on 2017/5/17.
 */
;(function ($) {
    var FindSure = function (conf) {
        person = {

        };
        basic = {
            id: "",
            medicareType:"",
            commonProvinceId: "110",
            commonCityId: "11",
            commonAreaId: "0",
            connectPersonName: "",
            connectType:"",
            connectDetail: ""
        };
        jibing= new Array();
        family= new Array();
    };
    FindSure.prototype = {
        init: function () {
            var _this = this;
            _this.admin_login();
        },
        admin_login:function () {
            var _this = this;
            $.ajax({
                type: "GET",
                url: "/apis/index/unSaveFiles/1",
                dataType: "json",
                success: function(e){
                    if(e.statusCode == 302){
                        location.href ="/login.html"
                    }else if(e.returnFlag == 0) {
                        _this.info();
                    }
                }
            });
        }
        ,
        info: function () {/*-----------------------------------个人信息--------------------------------------*/
            var _this = this;
            _this.basicd();
            _this.key =$.cookie("user");
            console.log("当前ID:"+_this.key);
            _this.huoquxinxi(_this.key);
            _this.all_save();
            $("input[type='text']").attr("maxlength","35");//所有input输入框字数限制
            /*民族编码*/
            $.getJSON("/apis/baseCommonType/mzbm",function(date){
                date.data.forEach(function(item){
                    var pOption = "<option value='"+item.value+"'>"+item.name+"</option>";
                    $(".geren-mz").append(pOption);
                });
            });
            /*个人信息日期*/
            $( ".geren-time,.geren-jd" ).datepicker({
                dateFormat:'yy-mm-dd',
                changeMonth: true,
                changeYear: true
            });
            var date=new Date;
            var year=date.getFullYear();
            var month=date.getMonth()+1;
            var tian=date.getDate();
            month =(month<10 ? "0"+month:month);
            var jd_date = (year.toString()+"-"+month.toString()+"-"+tian.toString());
            $(".geren-jd").val(jd_date);
            //性别
            $(".word-1-xb input[name='sex']").change(function () {
                _this.gender = $("input[name='sex']:checked").val();
                if(_this.gender == 1){
                    $(".yjs").hide()
                }else {
                    $(".yjs").show()
                }

            });
            //hr
            $("input[name='hr']").change(function () {
                if($(".geren-hr").is(':checked')){
                     $(this).attr("value","1")
                }
                else {
                     $(this).attr("value","0")
                }
                console.log($("input[name='hr']").val())
            });
            $(".updata1-r").bind("click",function () {
                _this.gender = $("input[name='sex']:checked").val();
                _this.rh = $("input[name='hr']").val()
            });
            //身份证
            $("#box-sf").change(function () {
                if ($(this).is(':checked')) {
                    $(".word-1-sf").addClass("on");
                    $("#word-l-zj").attr("disabled", "true");
                    $(".shenfenleixing").prop("disabled",true);
                    $(".box-show").show();
                } else {
                    $(".word-1-sf").removeClass("on");
                    $("#word-l-zj").removeAttr("disabled");
                    $(".box-show").hide();
                    $(".shenfenleixing").prop("disabled",false);
                }
            });
            $("#word-l-zj,#word-l-zj2").blur(function(){
                var nn =($("#word-l-zj").val().slice(6,10)  ||$("#word-l-zj2").val().slice(6,10));
                var yy =($("#word-l-zj").val().slice(10,12) ||$("#word-l-zj2").val().slice(10,12));
                var rr =($("#word-l-zj").val().slice(12,14) ||$("#word-l-zj2").val().slice(12,14));
                $('.geren-time').val(nn+"-"+yy+"-"+rr);
            });
            $('#defaultForm').bootstrapValidator({
                message: '输入值无效！',
                feedbackIcons: {
                    valid: 'glyphicon glyphicon-ok',
                    invalid: 'glyphicon glyphicon-remove',
                    validating: 'glyphicon glyphicon-refresh'
                },
                fields: {
                    productId: {
                        validators: {
                            notEmpty: {
                                message: '请选择一个商品'
                            }
                        }
                    }
                }
            }).on("success.form.bv", function (e) {
                e.preventDefault();//阻止默认行为
                person.birthday=$(".geren-time").val();//出生时间
                person.bloodType=$(".xuexing option:selected").val();//血型
                if($("#box-sf").is(':checked') == true){
                    person.cardNum=$("#word-l-zj2").val();
                    person.cardBelong=parseInt($(".suoshu").val());//证件所属
                }
                if($("#box-sf").is(':checked') == false){
                    person.cardNum=$("#word-l-zj").val();
                    person.cardBelong = 0;
                }
                person.cardType = $(".shenfenleixing").val();//证件类型
                person.country =$(".gj option:selected").val();//国家
                person.fileCreateTime=$(".geren-jd").val();//建档时间
                person.name=$("#bl-name").val();//姓名
                person.nation=$(".geren-mz option:selected").val();//民族
                person.rh=parseInt(_this.rh);//hr
                person.sex=parseInt(_this.gender);//性别
                person.id=_this.key;
                console.log(person.cardType);

                $.ajax({
                    /*-------------------------------请求服务器-------------------------------*/
                    type: "POST",
                    url: "/apis/file/personInfo",
                    data: JSON.stringify(person),
                    dataType: "json",
                    contentType: 'application/json',
                    success: function (data) {
                        //console.log(data);
                        _this.Datas = data.data;
                        _this.bug = data.returnFlag;
                        if(typeof(_this.key) == "object" && _this.bug == 0){
                            _this.data = _this.Datas;
                            $.cookie("user", _this.data);
                        }
                        if(_this.bug == 0 ){
                            window.location.href="new-document2.html";
                        }
                        if(_this.bug == 1){
                            alert("录入失败 身份证"+_this.Datas);
                            $(".updata1-r").attr("disabled",false);
                        }
                    },
                    error: function () {
                        alert("请求失败");
                    }
                });
            });
        },
        all_save:function () {
            var _this = this;
            $.ajax({
                type: "GET",
                url: "/apis/file/awaitConfirmedMessage/"+_this.key,
                dataType: "json",
                success: function(e){
                    console.log(e.data.slowDiseaseFlag);
                    //$(".updata8-r a").attr("href","new-document9.html")
                }
            });
            $(".new-right-baochun").click(function () {
                $.ajax({
                    type: "GET",
                    url: "/apis/file/awaitConfirmedMessage/"+_this.key,
                    dataType: "json",
                    success: function(e){
                        var sex = (e.data.sex== false)?"女":"男";
                        $(".baocun-name").text(e.data.name);
                        $(".baocun-sex").text(sex);
                        $(".baocun-age").text(e.data.age);
                        $(".baocun-fileNumber").text(e.data.fileNumber);
                        $(".baocun-slowDiseaseFlag").text(e.data.slowDiseaseFlag);
                        DiseaseFlag = e.data.slowDiseaseFlag;
                    }
                });
            });
            $(".baocun-queren").click(function () {
                var baocuns ={
                    personMasterInfoId:_this.key,
                    slowDiseaseFlag: DiseaseFlag
                };
                $.ajax({
                    /*-------------------------------请求服务器-------------------------------*/
                    type: "POST",
                    url: "/apis/file/save",
                    data: JSON.stringify(baocuns),
                    dataType: "json",
                    contentType: 'application/json',
                    success: function (data) {
                        _this.public(1);
                        $(".baochun").dialog('close');
                    },
                    error: function () {
                        alert("请求失败");
                    }
                });
            });
            $(".baocun-fanhui").bind("click",function () {
                $(".baochun").dialog('close');
            })
        },
        huoquxinxi:function (key_id) {
            /*------------------------------获取个人信息----------------------------------*/
            $.ajax({
                type: "GET",
                url: "/apis/file/"+key_id,
                dataType: "json",
                success: function (e) {
                    console.log(e.data);
                    function timeStamp2String(time){
                        var datetime = new Date();
                        datetime.setTime(time);
                        var year = datetime.getFullYear();
                        var month = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
                        var date = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
                        var hour = datetime.getHours()< 10 ? "0" + datetime.getHours() : datetime.getHours();
                        var minute = datetime.getMinutes()< 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();
                        var second = datetime.getSeconds()< 10 ? "0" + datetime.getSeconds() : datetime.getSeconds();
                        return year + "-" + month + "-" + date;
                    }

                    /*民族获取*/
                    $.getJSON("/apis/baseCommonType/mzbm",function(date){
                        date.data.forEach(function(item){
                            var pOption = "<option value='"+item.value+"'>"+item.name+"</option>";
                            $(".geren-mz").append(pOption);
                            $(".geren-mz").val(e.data.nation);
                        });
                    });
                    $("#bl-name").val(e.data.name);//姓名
                    $(".geren-time").val(timeStamp2String(e.data.birthday));//出生日期
                    $(".xuexing").val(e.data.bloodType);//血型
                    $(".geren-jd").val(timeStamp2String(e.data.fileCreateTime));//建档时间
                    if(e.data.cardBelong == 0){
                        $("#word-l-zj").val(e.data.cardNum).removeAttr("disabled");//身份证
                        $(".box-show").hide();
                    }else {
                        $("#word-l-zj2").val(e.data.cardNum);//身份证
                        $("#box-sf").attr("checked",true);
                        $(".box-show").show();
                        $(".word-1-sf").addClass("on");
                        $("#word-l-zj").attr("disabled", "true");
                        $(".suoshu").val(e.data.cardBelong);//证件所属
                        $(".shenfenleixing").prop("disabled",true);
                    }
                    if(e.data.sex == true){//性别
                        $("input[name='sex'][value='1']").attr("checked",true);
                        $(".yjs").hide();
                    }if(e.data.sex == false){
                        $(".updata7-l").attr("href","new-document6.html");
                        $("input[name='sex'][value='0']").attr("checked",true);
                        $(".yjs").show();
                    }

                    if(e.data.rh == true){//HR
                        $(".geren-hr").attr("checked",true);
                        $(".geren-hr").val(1)

                    }if(e.data.rh == false) {
                        $(".geren-hr").attr("checked",false);
                        $(".geren-hr").val(0)
                    }
                    /*------------------------------获取基本信息----------------------------------*/
                    $("#lianxiren").val(e.data.connectPersonName);//联系人
                    $(".word-yblb").val(e.data.medicareType);//医保类型
                    $(".word-2-tell2").val(e.data.connectDetail);//联系电话
                    $("#word-2-tell").val(e.data.connectType);//联系类型
                    $("#zhiye").val(e.data.professionType)//职业类别
                    $("#work").val(e.data.companyOrOrganization)//工作单位
                    $("#changzhu").val(e.data.commonAddressDetail)//常住地址
                    $("#huiji").val(e.data.registerAddressDetail)//户籍地址

                    $.getJSON("/apis/baseRegion/baseSelect/460000",function(date){
                        date.data.forEach(function(item){
                            var pOption = "<option value='"+item.value+"'>"+item.name+"</option>";
                            $("#sheng").append(pOption);
                            $("#dsheng").val(e.data.commonProvinceId);
                            $("#sheng").val(e.data.commonCityId);

                            $("#dsheng").change(function () {
                                if($("#dsheng").val() ==""){
                                    $("#sheng").children(":not(:first)").remove();
                                    $("#shi").children(":not(:first)").remove();
                                    $("#changzhu").val("");
                                }
                            })
                        });
                    });
                    $.getJSON("/apis/baseRegion/baseSelect/"+e.data.commonCityId,function(date){
                        date.data.forEach(function(item){
                            var sOption = "<option value='"+item.value+"'>"+item.name+"</option>";
                            $("#shi").append(sOption);
                            $("#shi").val(e.data.commonAreaId);
                        });
                    });

                    $.getJSON("/apis/baseRegion/baseSelect/460000",function(date){
                        date.data.forEach(function(item){
                            var pOption = "<option value='"+item.value+"'>"+item.name+"</option>";
                            $("#sheng2").append(pOption);
                            $("#dsheng2").val(e.data.registerProvinceId);
                            $("#sheng2").val(e.data.registerCityId);

                            $("#dsheng2").change(function () {
                                if($("#dsheng2").val() ==""){
                                    $("#sheng2").children(":not(:first)").remove();
                                    $("#shi2").children(":not(:first)").remove();
                                    $("#huiji").val("");
                                }
                            })
                        });
                    });
                    $.getJSON("/apis/baseRegion/baseSelect/"+e.data.registerCityId,function(date){
                        date.data.forEach(function(item){
                            var sOption = "<option value='"+item.value+"'>"+item.name+"</option>";
                            $("#shi2").append(sOption);
                            $("#shi2").val(e.data.registerAreaId);
                        });
                    });

                    $("#shi").attr("disabled",false);
                    $("#shi2").attr("disabled",false);

                    if(e.data.medicareType == 1){
                        $(".word-l-hua-xinghao").show();
                        $(".number").val(e.data.medicareCode);//医保编号
                        $(".word-bh1").show();
                        $(".word-bh2").hide();
                    }if (e.data.medicareType == 2 || e.data.medicareType == 3 || e.data.medicareType == ""){
                        $(".word-l-hua-xinghao").hide();
                        $(".number2").val(e.data.medicareCode);//医保编号
                        $(".word-bh1").hide();
                        $(".word-bh2").show();
                    }

                },
                error: function () {
                    console.log("当前没有可录用病例");
                }
            });
            /*------------------------------获取既往史信息----------------------------------*/
            $.getJSON("/apis/fileHistoryPastIllnessInfo/"+key_id,function(date){
                date.data.forEach(function(item){
                    if(item.requestId == "zwswt_jbmc" || !item.answerName == "无" ){
                        var sOption = "<div class='mode-word-1 jy'>" + "<div class='mingcheng-1' data='"+item.answerId+"'>" + item.answerName + "</div>" + "<div class='shijian-1'>" + item.answerDate + "</div>" + "<div class='xiu-1'>修改" + "</div>" + "<div class='shan-1'>删除" + "</div>" + "</div>";
                        $(".mode-jb-1.jws").append(sOption);

                        var mxb_cs1=(item.answerName.split('高血压')).length-1;
                        var mxb_cs2=(item.answerName.split('糖尿病')).length-1;
                        var mxb_cs3=(item.answerName.split('肺结核')).length-1;
                        var mxb_cs4=(item.answerName.split('精神病')).length-1;

                        if(mxb_cs1 >0){
                            $(".Chronic1").show().attr("data","new-document9.html").addClass("page")
                        }
                        else if(mxb_cs2 >0){
                            $(".Chronic2").show().attr("data","new-document10.html").addClass("page")
                        }
                        else if(mxb_cs3 >0){
                            $(".Chronic3").show().attr("data","new-document11.html").addClass("page")
                        }
                        else if(mxb_cs4 >0){
                            $(".Chronic4").show().attr("data","new-document12.html").addClass("page")
                        }

                        var nextpage = $(".new-left ul li.on").nextAll(".page").attr("data");//跳转 第8个页面
                        var prevpage = $(".new-left ul li.on").prevAll(".page").attr("data");
                        $(".page-s a").attr("href",nextpage);//下一页跳转
                        $(".page-u").attr("href",prevpage);//上一页跳转

                        if(item.createdTime == "无"){$(".mode-word-1.jy").remove();}
                    }
                    if(item.requestId == "zwswt_ssmc" || !item.answerName == "无"){
                        var sOption = "<div class='mode-word-2 jy'>" + "<div class='mingcheng-2' data='"+item.answerId+"'>" + item.answerName + "</div>" + "<div class='shijian-2'>" + item.answerDate + "</div>" + "<div class='xiu-2'>修改" + "</div>" + "<div class='shan-2'>删除" + "</div>" + "</div>";
                        $(".mode-jb-2.jws").append(sOption);
                        if(item.createdTime == "无"){$(".mode-word-2.jy").remove();}
                    }
                    if(item.requestId == "zwswt_wsmc" || !item.createdTime == "无"){
                        var sOption = "<div class='mode-word-3 jy'>" + "<div class='mingcheng-3' data='"+item.answerId+"'>" + item.answerName + "</div>" + "<div class='shijian-3'>" + item.answerDate + "</div>" + "<div class='xiu-3'>修改" + "</div>" + "<div class='shan-3'>删除" + "</div>" + "</div>";
                        $(".mode-jb-3.jws").append(sOption);
                        if(item.createdTime == "无"){$(".mode-word-3.jy").remove();}
                    }
                    if(item.requestId == "zwswt_sxyy" || !item.createdTime == "无"){
                        var sOption = "<div class='mode-word-4 jy'>" + "<div class='mingcheng-4' data='"+item.answerId+"'>" + item.answerName + "</div>" + "<div class='shijian-4'>" + item.answerDate + "</div>" + "<div class='xiu-4'>修改" + "</div>" + "<div class='shan-4'>删除" + "</div>" + "</div>";
                        $(".mode-jb-4.jws").append(sOption);
                        if(item.createdTime == "无"){$(".mode-word-4.jy").remove();}
                    }
                });
            });
            /*------------------------------获取家族史信息----------------------------------*/
            $.getJSON("/apis/fileFamilyHistoryInfo/"+key_id,function(date){
                if(date.data== null){
                   $("input[name='Fruits'][value='0']").click()
                }else {
                    date.data.forEach(function(item){
                        switch (item.relationshipId)
                        {
                            case 1:
                                item.relationshipId_M="父亲";
                                break;
                            case 2:
                                item.relationshipId_M="母亲";
                                break;
                            case 3:
                                item.relationshipId_M="爷爷";
                                break;
                            case 4:
                                item.relationshipId_M="奶奶";
                                break;
                            case 5:
                                item.relationshipId_M="兄弟";
                                break;
                            case 6:
                                item.relationshipId_M="姐妹";
                                break;
                            case -1:
                                item.relationshipId_M="其他监护人";
                                break;
                        }
                        item.relationshipId_D = item.relationshipId;
                        item.death_M = (item.death == false)?"否":"是";
                        item.death_D = (item.death == false)?"0":"1";
                        item.selfHad_M = (item.selfHad == false)?"否":"是";
                        item.selfHad_D = (item.selfHad == false)?"0":"1";
                        var pOption = "<div class='jzs-all-word2'>"+"<div class='jzs-all-word-1' data='"+item.diseaseId+"'>"+item.diagnosisName+"</div>"+"<div class='jzs-all-word-2' data='"+item.relationshipId_D+"'>"+item.relationshipId_M+"</div>"+"<div class='jzs-all-word-3' data='"+item.death_D+"'>"+item.death_M+"</div>"+"<div class='jzs-all-word-4' data='"+item.selfHad_D+"'>"+item.selfHad_M+"</div>"+"<div class='jzs-all-word-shanchu'>删除</div>"+"</div>";
                        $(".jzs-all-word").append(pOption);
                    });
                   $("input[name='Fruits'][value='1']").click()
                }
                //console.log(date.data)
            });
            /*------------------------------获取高血压情况-----------------------------------*/
            function boxs(names,attrs) {//复选框封装
                for(var i =0; i<attrs.length; i++){
                    $("input[name='"+names+"'][value='"+attrs[i]+"']").attr("checked",true);
                }
                $("input[name='"+names+"']:checked").each(function(){
                    $(this).change();
                });
            }
            $.ajax({
                type: "GET",
                url: "/apis/fileHypertensionInfo/"+key_id,
                dataType: "json",
                success: function (e) {
                    //console.log(e.data);
                    if(e.data== null){
                        gxy_id=null;
                    }else{
                        gxy_id=e.data.id;
                        $("#fenji").val(e.data.conditionGrade);//分级
                        $("#fenji").trigger("change");
                        $("#fenzhu").val(e.data.conditionGroup);//分组
                        $("#fenzhu").trigger("change");
                        $("input[name='ApplyUnit']").val(e.data.visitCount);//随访频率 次数
                        $("#gxyny").val(e.data.visitUnit);//随访频率 年/月
                        $("#gxyny").trigger("change");
                        $("#gxylei").val(e.data.hypertensionType);//高血压类
                        $("#gxylei").trigger("change");
                        $("#gxyjctj").val(e.data.checkWay);//检出途径
                        $("#gxyjctj").trigger("change");
                        $("input[name='gxy_zixiang'][value='"+e.data.bloodPressureSituation+"']").attr("checked",true).change();//血压知晓情况
                        var xueya_sp = e.data.bloodPressureLevel.split('/');
                        $("input[name='gxy_shuihan1']").val(xueya_sp[0]);//未服用降压药前血压水平1
                        $("input[name='gxy_shuihan2']").val(xueya_sp[1]);//未服用降压药前血压水平2
                        $("input[name='gxy_fuyao'][value='"+e.data.takeAntihypertensiveDrugs+"']").attr("checked",true).change();//是否服用降压药
                        $("input[name='gxy_zhixiaoxue'][value='"+e.data.bloodFatSituation+"']").attr("checked",true).change();//血脂知晓情况
                        $("input[name='gxy_shengao']").val(parseFloat(e.data.height));//身高
                        $("input[name='gxy_tizhong']").val(e.data.weight);//体重
                        $("input[name='gxy_bmi']").val(e.data.bodyMassIndex);//*BMI（kg/m²）

                        boxs("gxy_qiguan",e.data.targetOrganDamageParams);//靶器官损坏
                        boxs("gxy_gxb",e.data.chronicDiseaseParams);//患其它慢病

                        $("input[name='gxy_xingwei'][value='"+e.data.complianceBehavior+"']").attr("checked",true).change();//遵医行为
                    }
                },
                error:function (data) {
                    //console.log(data);
                }
            });
            /*------------------------------获取糖尿病情况-----------------------------------*/
            $.ajax({
                type: "GET",
                url: "/apis/fileDiabetesInfo/"+key_id,
                dataType: "json",
                success: function (e) {
                    if(e.data== null){
                        tnb_id=null;
                    }else{
                        tnb_id=e.data.id;
                        $("input[name='tnb_pinlv']").val(e.data.visitCount);//随访频率 次数
                        $("#tnb_nyn").val(e.data.visitUnit).change();//随访频率 年/月/周
                        $("#tnb_leixing").val(e.data.diabetesType).change();//糖尿病类型
                        $("#tnb_tuijing").val(e.data.checkWay).change();//检出途径
                        $("input[name='tnb_zhixiao'][value='"+e.data.bloodSugarSituation+"']").attr("checked",true).change();//糖尿病知晓情况
                        $("input[name='tnb_xuetang']").val(e.data.emptyBloodSugar);//未服用降糖药前血糖水平 空腹
                        $("input[name='tnb_shuji']").val(e.data.randomBloodSugar);//未服用降糖药前血糖水平 随机
                        $("input[name='tnb_fuyao'][value='"+e.data.medication+"']").attr("checked",true).change();//是否服药

                        boxs("tnb_bingfa",e.data.complicationParams);//并发症
                        $("input[name='tnb_xingwei'][value='"+e.data.complianceBehavior+"']").attr("checked",true).change();//遵医行为
                    }
                },
                error:function (data) {
                    //console.log(data);
                }
            });
            /*------------------------------获取肺结核情况-----------------------------------*/
            $.ajax({
                type: "GET",
                url: "/apis/filePulmonaryTuberculosisInfo/"+key_id,
                dataType: "json",
                success: function (e) {
                    if(e.data== null){
                        fjh_id=null;
                    }else{
                        fjh_id=e.data.id;
                        $("input[name='fjh_pinlv']").val(e.data.visitCount);//随访频率 次数
                        $("#fjh_nyn").val(e.data.visitUnit).change();//随访频率 年/月/周
                        $("#fjh_leixing").val(e.data.pulmonaryTuberculosisType).change();//糖尿病类型
                        $("#fjh_tuijing").val(e.data.checkWay).change();//检出途径

                        boxs("fjh_zhengzhuang",e.data.symptomParams);//症状
                        boxs("fjh_hbzs",e.data.complicationParams);//合并症

                        $("input[name='fjh_tizhong']").val(e.data.weight);//体重
                        $("input[name='fjh_shengao']").val(e.data.height);//身高
                        $("input[name='fjh_BMI']").val(e.data.bodyMassIndex);//BMI（kg/m²）
                        $("input[name='fjh_ggn'][value='"+e.data.liverFunctionCheck+"']").attr("checked",true).change();///肝功能检测
                        $("input[name='fjh_fangan'][value='"+e.data.chemotherapyPlan+"']").attr("checked",true).change();//化疗方案
                        $("input[name='fjh_xingwei'][value='"+e.data.complianceBehavior+"']").attr("checked",true).change();//遵医行为
                    }
                },
                error:function (data) {
                    //console.log(data);
                }
            });
            /*------------------------------获取精神病情况-----------------------------------*/
            $.ajax({
                type: "GET",
                url: "/apis/fileMentalDiseaseInfo/"+key_id,
                dataType: "json",
                success: function (e) {
                    if(e.data== null){
                        jsb_id=null;
                        //省
                        $.getJSON("/apis/baseRegion/baseSelect/0",function(date){
                            date.data.forEach(function(item){
                                var pOption = "<option value='"+item.value+"'>"+item.name+"</option>";
                                $("#jsb_sheng").append(pOption);
                            });
                        });

                        //省-联动市
                        $("#jsb_sheng").change(function(){
                            var pId = $("#jsb_sheng").val(); //获取省级Value
                            $("#jsb_shi").attr("disabled",false);//打开选项
                            $("#jsb_shi").children(":not(:first)").remove();//第一个符合条件的去除 市
                            $("#jsb_qu").children(":not(:first)").remove();//第一个符合条件的去除  区
                            $.getJSON("/apis/baseRegion/baseSelect/"+pId,function(date){
                                date.data.forEach(function(item){//遍历
                                    if(item.value.slice(0,2) == pId.slice(0,2)){
                                        var sOption = "<option value='"+item.value+"'>"+item.name+"</option>";
                                        $("#jsb_shi").append(sOption);
                                    }
                                });
                            });
                        });
                        //市-联动区
                        $("#jsb_shi").change(function(){
                            var sId = $("#jsb_shi").val();//获取市级Value
                            $("#jsb_qu").attr("disabled",false);//打开区选项
                            $("#jsb_qu").children(":not(:first)").remove();//第一个符合条件的去除 区
                            $.getJSON("/apis/baseRegion/baseSelect/"+sId,function(date){
                                date.data.forEach(function(item){
                                    if(item.value.slice(0,4) == sId.slice(0,4)){
                                        var qOption = "<option value='"+item.value+"'>"+item.name+"</option>";
                                        $("#jsb_qu").append(qOption);
                                    }
                                });
                            });
                        });
                    }else{
                        jsb_id=e.data.id;
                        $("input[name='jsbpinlv']").val(e.data.visitCount);//随访频率
                        $("#jsbday").val(e.data.visitUnit).change();//随访频率(年)
                        $("input[name='jsbname']").val(e.data.guardianName);//监护人姓名
                        $("#jsbguanxi").val(e.data.patientRelationship).change();//与患者关系
                        $("input[name='jsbdizhi']").val(e.data.guardianAddressDetail);//监护人住址(详)
                        $("input[name='jsbphone']").val(e.data.guardianTelephone);//监护人电话
                        $("input[name='jsbtime']").val(e.data.firstMorbidityDateStr);//初次发病时间
                        //console.log(e.data.firstMorbidityDate);

                        for(var i =0; i<e.data.pastMainSymptomParams.length; i++){//既往主要症状
                            if(e.data.pastMainSymptomParams[i].slice(0,2)=="其它"){
                                $("input[name='jsbzz'][value='"+e.data.pastMainSymptomParams[i].slice(0,2)+"']").attr("checked",true);
                                $(".jsbqt").val(e.data.pastMainSymptomParams[i]);
                                $("input[name='jsbzz_qt']").val(e.data.pastMainSymptomParams[i].match(/其它(\S*)/)[1])
                            }else {
                                $("input[name='jsbzz'][value='"+e.data.pastMainSymptomParams[i]+"']").attr("checked",true);
                            }
                        }
                        $("input[name='jsbzz']:checked").each(function(){
                            $(this).change();
                        });

                        $("input[name='jsbqingkuang'][value='"+e.data.pastTreatmentDepartment+"']").attr("checked",true).change();//既往治疗情况(门诊)
                        $("input[name='jsbzhuyuan']").val(e.data.pastTreatmentCount);//既往治疗情况(住院)
                        $("input[name='jsbzhenduan']").val(e.data.latelyDiagnosisDisease);//最近诊断情况(诊断)
                        $("input[name='jsbyiyuan']").val(e.data.latelyDiagnosisHospital);//最近诊断情况(诊断医院)
                        $("input[name='jsbriqi']").val(e.data.latelyDiagnosisTimeStr);//最近诊断情况(日期)
                        $("input[name='jsbzlxg'][value='"+e.data.latelyDiagnosisEffect+"']").attr("checked",true).change();//最近一次治疗效果
                        $("input[name='jsbyingxiang'][value='"+e.data.familyEffectSituation+"']").attr("checked",true).change();//患病对家庭社会的影响
                        $('input[type="radio"][name="jsbyingxiang"]:checked').siblings("input[name='jsbyingxiang02']").val(e.data.familyEffectCount);//患病对家庭社会的影响(次数)
                        $('input[type="radio"][name="jsbyingxiang"]:checked').siblings("input[name='jsbyingxiang02']").attr("value",e.data.familyEffectCount);//患病对家庭社会的影响(次数)
                        $("input[name='jsbguanjian'][value='"+e.data.closeLockSituation+"']").attr("checked",true).change();//关锁情况
                        $("input[name='jsbyingwei'][value='"+e.data.complianceBehavior+"']").attr("checked",true).change();//遵医行为

                        //省
                        $.getJSON("/apis/baseRegion/baseSelect/0",function(date){
                            date.data.forEach(function(item){
                                var pOption = "<option value='"+item.value+"'>"+item.name+"</option>";
                                $("#jsb_sheng").append(pOption);
                                $("#jsb_sheng").val(e.data.guardianProvinceId);//设置默认选中 省
                                $('#jsb_sheng').trigger("change");
                            });
                        });

                        //省-联动市
                        $("#jsb_sheng").change(function(){
                            var pId = $("#jsb_sheng").val(); //获取省级Value
                            $("#jsb_shi").attr("disabled",false);//打开选项
                            $("#jsb_shi").children(":not(:first)").remove();//第一个符合条件的去除 市
                            $("#jsb_qu").children(":not(:first)").remove();//第一个符合条件的去除  区
                            $.getJSON("/apis/baseRegion/baseSelect/"+pId,function(date){
                                date.data.forEach(function(item){//遍历
                                    if(item.value.slice(0,2) == pId.slice(0,2)){
                                        var sOption = "<option value='"+item.value+"'>"+item.name+"</option>";
                                        $("#jsb_shi").append(sOption);
                                        $("#jsb_shi").val(e.data.guardianCityId);//设置默认选中 市
                                        $('#jsb_shi').trigger("change");
                                    }
                                });
                            });
                        });
                        //市-联动区
                        $("#jsb_shi").change(function(){
                            var sId = $("#jsb_shi").val();//获取市级Value
                            $("#jsb_qu").attr("disabled",false);//打开区选项
                            $("#jsb_qu").children(":not(:first)").remove();//第一个符合条件的去除 区
                            $.getJSON("/apis/baseRegion/baseSelect/"+sId,function(date){
                                date.data.forEach(function(item){
                                    if(item.value.slice(0,4) == sId.slice(0,4)){
                                        var qOption = "<option value='"+item.value+"'>"+item.name+"</option>";
                                        $("#jsb_qu").append(qOption);
                                        $("#jsb_qu").val(e.data.guardianAreaId);//设置默认选中 区
                                        $('#jsb_qu').trigger("change");
                                    }
                                });
                            });
                        });
                    }

                },
                error:function (data) {
                    //console.log(data);
                }
            });
            /*------------------------------获取局部信息-----------------------------------*/
            var level = $(".new-left ul li.on").text();
            if(level != "个人信息"){
                $.ajax({
                        type: "GET",
                        url: "/apis/file/"+key_id,
                        dataType: "json",
                        success: function (e) {
                            console.log(e.data.name);
                            var xingbie = (e.data.sex == true)?"男":"女";
                            switch(e.data.bloodType)
                            {
                                case 1:
                                    e.data.bloodType ="A型";
                                    break;
                                case 2:
                                    e.data.bloodType="B型";
                                    break;
                                case 3:
                                    e.data.bloodType="O型";
                                    break;
                                case 4:
                                    e.data.bloodType="AB型";
                                    break;
                                case -1:
                                    e.data.bloodType="不详";
                                    break;
                            }
                            $(".new-right-show-n-1").text(e.data.name);
                            $(".new-right-show-n-2").text(xingbie);
                            var newtime = new Date();
                            $(".new-right-show-n-3").text(newtime.getFullYear() - e.data.cardNum.slice(6,10));
                        }
                })
            }
        }
        ,
        basicd: function () {/*基本信息*/
             var _this = this;
            $(".word-yblb").change(function () {
                var opt=$(".word-yblb").val();
                if(opt == 1){
                    $(".word-l-hua-xinghao").show();
                    $(".word-bh1").show();
                    $(".word-bh2").hide();
                    $(".number2").val("");
                }if (opt == 2 || opt == 3 || opt == ""){
                    $(".word-l-hua-xinghao").hide();
                    $(".word-bh1").hide();
                    $(".word-bh2").show();
                    $(".number").val("");
                }
            });
            /*三联获取地区1*/
            $("#dsheng").change(function () {
            $.getJSON("/apis/baseRegion/baseSelect/460000",function(date){
                date.data.forEach(function(item){
                    var pOption = "<option value='"+item.value+"'>"+item.name+"</option>";
                    $("#sheng").append(pOption);
                });
            });});
            //市
            $("#sheng").change(function(){
                var pId = $("#sheng").val();
                $("#shi").attr("disabled",false);
                $("#shi").children(":not(:first)").remove();
                $("#qu").children(":not(:first)").remove();
                $.getJSON("/apis/baseRegion/baseSelect/"+pId.slice(0,4)+"00",function(date){
                    /*console.log(pId);*/
                    date.data.forEach(function(item){
                        if(item.value.slice(0,4) == pId.slice(0,4)){
                            var sOption = "<option value='"+item.value+"'>"+item.name+"</option>";
                            $("#shi").append(sOption);
                        }
                    });
                });
            });
            /*三联获取地区2*/
            $("#dsheng2").change(function () {
                //省
                $.getJSON("/apis/baseRegion/baseSelect/460000",function(date){
                    date.data.forEach(function(item){
                        var pOption = "<option value='"+item.value+"'>"+item.name+"</option>";
                        $("#sheng2").append(pOption);
                    });
                });
            });
            //市
            $("#sheng2").change(function(){
                var pId = $("#sheng2").val();
                $("#shi2").attr("disabled",false);
                $("#shi2").children(":not(:first)").remove();
                $("#qu2").children(":not(:first)").remove();
                $.getJSON("/apis/baseRegion/baseSelect/"+pId.slice(0,4)+"00",function(date){
                    /*console.log(pId);*/
                    date.data.forEach(function(item){
                        if(item.value.slice(0,4) == pId.slice(0,4)){
                            var sOption = "<option value='"+item.value+"'>"+item.name+"</option>";
                            $("#shi2").append(sOption);
                        }
                    });
                });
            });
            /*end 三联2*/

            /*-------------------------------输入基本信息-------------------------------*/
            $('#defaultForm2').bootstrapValidator({
                message: '输入值无效！',
                feedbackIcons: {
                    valid: 'glyphicon glyphicon-ok',
                    invalid: 'glyphicon glyphicon-remove',
                    validating: 'glyphicon glyphicon-refresh'
                },
                fields: {
                    productId: {
                        validators: {
                            notEmpty: {
                                message: '请选择一个商品'
                            }
                        }
                    },
                    sheng2: {
                        enabled: false,
                        validators: {
                            notEmpty: {
                                message: ''
                            }
                        }
                    },
                    shi2: {
                        enabled: false,
                        validators: {
                            notEmpty: {
                                message: ''
                            }
                        }
                    },
                    huiji: {
                        enabled: false,
                        validators: {
                            notEmpty: {
                                message: '请输入地址!'
                            }
                        }
                    },
                    jbxxphone: {
                        validators: {
                            notEmpty: {
                                message: '手机号码为必填项!'
                            },
                            regexp: {
                                regexp: /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/,
                                message: '请输入正确的手机号码'
                            }
                        }
                    },
                    lianxiren:{
                        validators: {
                            notEmpty: {
                                message: '联系人为必填项!'
                            },
                            stringLength: {
                                min: 0,
                                max: 15,
                                message: '联系人名称不能过长！'
                            }
                        }
                    },
                    changzhu:{
                        validators: {
                            notEmpty: {
                                message: '常住地址为必填项!'
                            },
                            stringLength: {
                                min: 0,
                                max: 15,
                                message: '常住地址不能过长！'
                            }
                        }
                    },
                    yibaobianhao:{
                        validators: {
                            notEmpty: {
                                message: '医保编号为必填项!'
                            },
                            stringLength: {
                                min: 0,
                                max: 15,
                                message: '医保编号不能过长！'
                            }
                        }
                    }
                }
            }).on("success.form.bv", function (e) {
                e.preventDefault();//阻止默认行为

                basic.id = _this.key;//返回ID
                basic.medicareType = $(".word-yblb option:selected").val();//医保类型
                basic.medicareCode = ($(".number").val() || $(".number2").val());//医保编号
                basic.connectPersonName = $(".word-2-lx input").val();//联系人
                basic.connectType = $("#word-2-tell option:selected").val();//联系类型
                basic.connectDetail = $(".word-2-tell2").val();//联系电话
                basic.commonAreaId=$("#shi option:selected").val();//地区ID
                basic.commonCityId=$("#sheng option:selected").val();//城市ID
                basic.commonProvinceId=$("#dsheng option:selected").val();//省ID
                basic.companyOrOrganization=$("#work").val();//工作单位
                basic.commonAddressDetail=$("#changzhu").val();//详细地址
                basic.professionType=$("#zhiye option:selected").val();//职业类别
                basic.registerAddressDetail=$("#huiji").val();//户籍详细地址
                basic.registerAreaId=$("#shi2 option:selected").val();//户籍所在区ID
                basic.registerCityId=$("#sheng2 option:selected").val();//户籍所在市ID
                basic.registerProvinceId=$("#dsheng2 option:selected").val();//户籍所在省ID

                //console.log("省"+typeof(basic.commonProvinceId) );
                $.ajax({
                    /*-------------------------------请求服务器-------------------------------*/
                    type: "POST",
                    url: "/apis/file/basicInfo",
                    data: JSON.stringify(basic),
                    dataType: "json",
                    contentType: 'application/json',
                    success: function (data) {
                        _this.bug = data.returnFlag;
                        if(_this.bug ==0 ){
                            window.location.href="new-document3.html";
                        }
                    },
                    error: function () {
                        alert("请求失败");

                    }
                });
                /*-------------------------提交成功按钮-----------------------*/

            });
            $('#dsheng2').on('change', function() {//动态验证 户籍地址
                var bootstrapValidator = $('#defaultForm2').data('bootstrapValidator'),
                    shipNewAddress = ($(this).val() == '460000');
                shipNewAddress ? $('#newAddress').find('.form-control').removeAttr('disabled')
                    : $('#newAddress').find('.form-control').attr('disabled', 'disabled');
                bootstrapValidator.enableFieldValidators('sheng2', shipNewAddress)
                    .enableFieldValidators('shi2', shipNewAddress)
                    .enableFieldValidators('huiji', shipNewAddress)
            });

             _this.history();
        },
        history: function () {/*-----------------------既往史-------------------------------*/
            var _this = this;
            _this.Familyhistory();
            var date=new Date;
            var year=date.getFullYear();
            var month=date.getMonth()+1;
            var tian=date.getDate();
            month =(month<10 ? "0"+month:month);
            tian = (tian<10 ? "0"+tian:tian);
            var jd_date = (year.toString()+"-"+month.toString()+"-"+tian.toString());
            /*添加*/
            $( ".duihua1,.duihua2,.duihua3,.duihua4,.baochun" ).dialog({
                autoOpen: false,
                width :600,
                height :300
            });
            $( ".duihua5" ).dialog({
                autoOpen: false,
                width :700,
                height :300
            });

            $( ".mode-tianjia-1" ).click(function() {
                $( ".duihua1" ).dialog( "open" );
                $( ".duihua2" ).dialog( "close" );
                $( ".duihua3" ).dialog( "close" );
                $( ".duihua4" ).dialog( "close" );
                $( ".duihua1" ).dialog({position: [450,350]});
                $(".duihua1-1").val("");
                $(".jbmingcheng").val("");
                $(".dhdate1").val(jd_date)
            });
            $( ".mode-tianjia-2" ).click(function() {
                $( ".duihua2" ).dialog( "open" );
                $( ".duihua1" ).dialog( "close" );
                $( ".duihua3" ).dialog( "close" );
                $( ".duihua4" ).dialog( "close" );
            $( ".duihua2" ).dialog({position: [450,350]});$(".duihua2-1").val(""); $(".ssmingcheng").val(""); $(".dhdate2").val(jd_date)});
            $( ".mode-tianjia-3" ).click(function() {
                $( ".duihua3" ).dialog( "open" );
                $( ".duihua1" ).dialog( "close" );
                $( ".duihua2" ).dialog( "close" );
                $( ".duihua4" ).dialog( "close" );
            $( ".duihua3" ).dialog({position: [450,350]});$(".duihua3-1").val(""); $(".dhdate3").val(jd_date)});
            $( ".mode-tianjia-4" ).click(function() {
                $( ".duihua4" ).dialog( "open" );
                $( ".duihua1" ).dialog( "close" );
                $( ".duihua2" ).dialog( "close" );
                $( ".duihua3" ).dialog( "close" );
            $( ".duihua4" ).dialog({position: [450,350]});$(".duihua4-1").val(""); $(".dhdate4").val(jd_date)});

            $( ".new-right-baochun" ).click(function() {$( ".baochun" ).dialog( "open" );});

            /*------------------------------疾病名称和手术名称 的自动填充-----------------------------*/
            $(function() {
                function mhcx(url,divname) {//封装模糊查询
                    $.getJSON(url,function(e){
                        $(function() {
                            var duihua2 = [];
                            e.data.forEach(
                                function (data) {
                                    var s = {
                                        label:data.name,
                                        key:data.value
                                    };
                                    duihua2.push(s);
                                }
                            );
                            $("."+ divname).keyup(function(e){
                                if(e.keyCode==13){
                                    $("."+ divname).attr("data",ui.item.key);
                                    $("."+ divname).val(ui.item.label);
                                }
                                $(this).attr("data","")
                            });
                            var auto = $("."+ divname).attr("autocomplete");
                            if(auto != "off") {
                                $("."+ divname).autocomplete({
                                    source: duihua2
                                    , select: function(e, ui) {
                                        $("."+ divname).attr("data",ui.item.key);
                                        $("."+ divname).val(ui.item.label);
                                        return false;
                                    }
                                });
                            }


                        });
                    });
                }
                mhcx("/apis/baseDiseaseDiagnosis/list","jbmingcheng");//疾病名称
                mhcx("/apis/baseOperation/list","ssmingcheng");//手术名称
                mhcx("/apis/baseMedicament/list","duihua1-1");//药物名称
                //mhcx("/apis/baseOperation/list","duihua2-1");//食物名称
                //mhcx("/apis/baseOperation/list","duihua3-1");//花粉名称
            });
            /*------------------------------外伤名称 的自动填充-----------------------------*/
            $.getJSON("/apis/baseCommonType/wsmc",function(e){
                $(function() {
                    e.data.forEach(
                        function (data) {
                           $(".duihua3-1").append("<option value='"+data.key+"'>"+data.name+"</option>");
                        }
                    );
                    $(".duihua3-1").change(function () {
                        $(this).attr("data",$(".duihua3-1").val());

                    });
                });
            });
            /*----------------------------------输血原因 的信息获取-----------------------------*/
            $(".duihua4-1").change(function () {
                $(this).attr("data",$(".duihua4-1").val());

            });
            /*----------------------------------疾病名称 提交-----------------------------------*/
            var blzhis_D = 0;//1
            var s1s = new Set();
            $(".jbmingcheng-an").bind("click",function () {
                var blzhi = $( ".jbmingcheng" ).val();
                var blzhi_T = $(".dhdate1").val();
                var blzhi_data = $(".jbmingcheng").attr("data");
                var size  = s1s.size;
                blzhi_T = (blzhi_T==null||blzhi_T==undefined)? "":blzhi_T;

                if(blzhi.trim() == ""){
                    $(".error1-msg").html("输入框不能为空,请输入有效内容后再提交！");
                    $( ".duihua1-1").focus();
                }else if($(".jbmingcheng").attr("data")=="" || $(".jbmingcheng").attr("data")==null){
                    $(".error1-msg").html("无效病例！");
                }
                else {
                    s1s.add(blzhi);
                    //console.log(s1s.size);
                    if (s1s.size == size) {
                        $(".error1-msg").html("内容重复，修改后再提交！");
                    }else {
                        $(".error1-msg").html("");
                        blzhis_D++;
                        $(".mode-jb-1").prepend("<div class='mode-word-1 jy'>" + "<div class='mingcheng-1' data='"+blzhi_data+"'>" + blzhi + "</div>" + "<div class='shijian-1'>" + blzhi_T + "</div>" + "<div class='xiu-1'>修改" + "</div>" + "<div class='shan-1'>删除" + "</div>" + "</div>");
                        $( ".duihua1" ).dialog('close');
                    }
                }
            });
            /*----------------------------------手术名称 提交-----------------------------------*/
            var blzhis_D = 0;//1
            var shyz = new Set();
            $(".ssmingcheng-an").bind("click",function () {
                var blzhi = $( ".ssmingcheng" ).val();
                var blzhi_T = $(".dhdate2").val();
                var blzhi_data = $(".ssmingcheng").attr("data");
                var size  = shyz.size;
                blzhi_T = (blzhi_T==null||blzhi_T==undefined)? "":blzhi_T;

                if(blzhi.trim() == ""){
                    $(".error2-msg").html("输入框不能为空,请输入有效内容后再提交！");
                    $( ".duihua2-1").focus();
                }else if($(".ssmingcheng").attr("data")=="" || $(".ssmingcheng").attr("data")==null){
                    $(".error2-msg").html("无效病例！");
                }
                else {
                    shyz.add(blzhi);
                    //console.log(shyz.size);
                    if (shyz.size == size) {
                        $(".error2-msg").html("内容重复，修改后再提交！");
                    }else {
                        $(".error2-msg").html("");
                        blzhis_D++;
                        $(".mode-jb-2").prepend("<div class='mode-word-2 jy'>" + "<div class='mingcheng-2' data='"+blzhi_data+"'>" + blzhi + "</div>" + "<div class='shijian-2'>" + blzhi_T + "</div>" + "<div class='xiu-2'>修改" + "</div>" + "<div class='shan-2'>删除" + "</div>" + "</div>");
                        $( ".duihua2" ).dialog('close');
                    }
                }
            });
            /*----------------------------------药物名称 含(疾病名称 弹窗部分)提交-----------------------------------*/
           var blzhi_D = 0;//1
            var s1 = new Set();
            $(".duihua1-1-an").bind("click",function () {
                var blzhi = $( ".duihua1-1" ).val();
                var blzhi_T = $(".dhdate1").val();
                var blzhi_data = $(".duihua1-1").attr("data");
                var size  = s1.size;
                blzhi_T = (blzhi_T==null||blzhi_T==undefined)? "":blzhi_T;
                var auto1 = $( ".duihua1-1" ).attr("autocomplete");
                if(blzhi.trim() == ""){
                   $(".error1-msg").html("输入框不能为空,请输入有效内容后再提交！");
                    $( ".duihua1-1").focus();
                }
                else {
                    s1.add(blzhi);
                    //console.log(s1.size);
                    if (s1.size == size) {
                        $(".error1-msg").html("内容重复，修改后再提交！");
                    }else {
                        $(".error1-msg").html("");
                        blzhi_D++;
                        $(".duihua1").dialog('close');
                        $(".mode-jb-1").prepend("<div class='mode-word-1 jy'>" + "<div class='mingcheng-1' data='"+blzhi_data+"'>" + blzhi + "</div>" + "<div class='shijian-1'>" + blzhi_T + "</div>" + "<div class='xiu-1'>修改" + "</div>" + "<div class='shan-1'>删除" + "</div>" + "</div>")
                    }
                }
            });
            /*----------------------------------食物名称 含（手术名称 弹窗部分）提交-----------------------------------*/
            var shoushu_D = 0;//2
            var  s2 = new Set();
            $(".duihua2-1-an").bind("click",function () {
                var blzhi = $( ".duihua2-1" ).val();
                var blzhi_T = $(".dhdate2").val();
                var blzhi_data = $(".duihua2-1").attr("data");
                var size  = s2.size;
                blzhi_T = (blzhi_T==null||blzhi_T==undefined)? "":blzhi_T;
                if(blzhi.trim() == ""){
                    $(".error2-msg").html("输入框不能为空,请输入有效内容后再提交！");
                    $( ".duihua2-1").focus();
                } else {
                    s2.add(blzhi);
                    if (s2.size == size) {
                        $(".error2-msg").html("内容重复，修改后再提交！");
                    } else {
                        $(".error2-msg").html("");
                        shoushu_D++;
                        $(".duihua2").dialog('close');
                        $(".mode-jb-2").prepend("<div class='mode-word-2 jy'>" + "<div class='mingcheng-2' data='"+blzhi_data+"'>" + blzhi + "</div>" + "<div class='shijian-2'>" + blzhi_T + "</div>" + "<div class='xiu-2'>修改" + "</div>" + "<div class='shan-2'>删除" + "</div>" + "</div>")
                    }
                }
            });
            /*----------------------------------外伤名称 含（花粉名称） 提交-----------------------------------*/
            var waishang_D = 0;//1
            var  s3 = new Set();
            $(".duihua3-1-an").bind("click",function () {
                var blzhi = ($( ".duihua3-1 option:selected" ).text() || $(".duihua3-1").val());
                var blzhi_T = $(".dhdate3").val();
                var blzhi_data = $(".duihua3-1").attr("data");
                var size  = s3.size;
                blzhi_T = (blzhi_T==null||blzhi_T==undefined)? "":blzhi_T;
                if( $( ".duihua3-1 option:selected" ).val() == "" ){
                    alert("请选择下拉框");
                    return false;
                }
                if(blzhi.trim() == ""){
                    $(".error3-msg").html("输入框不能为空,请输入有效内容后再提交！");
                    $( ".duihua3-1").focus();
                }else {
                    s3.add(blzhi);
                    if (s3.size == size) {
                        $(".error3-msg").html("内容重复，修改后再提交！");
                    } else {
                        $(".error3-msg").html("");
                        waishang_D++;
                        $(".mode-jb-3").prepend("<div class='mode-word-3 jy'>" + "<div class='mingcheng-3' data='"+blzhi_data+"'>" + blzhi + "</div>" + "<div class='shijian-3'>" + blzhi_T + "</div>" + "<div class='xiu-3'>修改" + "</div>" + "<div class='shan-3'>删除" + "</div>" + "</div>");
                        $( ".duihua3" ).dialog('close');
                    }
                }
            });
            /*----------------------------------输血原因 含（其他） 提交-----------------------------------*/
            var shuxue_D = 0;//1
            var  s4 = new Set();
            $(".duihua4-1-an").bind("click",function () {
                var blzhi = ($( ".duihua4-1 option:selected" ).text() || $(".duihua4-1").val());
                var blzhi_T = $(".dhdate4").val();
                var blzhi_data = $(".duihua4-1").attr("data");
                var size  = s4.size;
                blzhi_T = (blzhi_T==null||blzhi_T==undefined)? "":blzhi_T;

                var buxuan = $(".mode-jb-4 .mingcheng-4").attr("data");
                $(".duihua4-1 [value='"+buxuan+"']").prop('disabled', true);

                if( $( ".duihua4-1 option:selected" ).val() == "" ){
                    alert("请选择下拉框");
                    return false;
                }
                if(blzhi.trim() == ""){
                    $(".error4-msg").html("输入框不能为空,请输入有效内容后再提交！");
                    $( ".duihua4-1").focus();
                }else {
                    s4.add(blzhi);
                    if (s4.size == size) {
                        $(".error4-msg").html("内容重复，修改后再提交！");
                    } else {
                        $(".error4-msg").html("");
                        shuxue_D++;
                        $(".mode-jb-4").prepend("<div class='mode-word-4 jy'>" + "<div class='mingcheng-4' data='"+blzhi_data+"'>" + blzhi + "</div>" + "<div class='shijian-4'>" + blzhi_T + "</div>" + "<div class='xiu-4'>修改" + "</div>" + "<div class='shan-4'>删除" + "</div>" + "</div>");
                        $( ".duihua4" ).dialog('close');
                    }
                }
            });
            /*----------------------------------疾病名称 修改-----------------------------------*/
            $("body").on("click",".xiu-1", function(){
                _syindex = $(this).parents(".mode-word-1").index();
                var zz = $(".mode-jb-1").find(".mode-word-1").eq(_syindex).find(".mingcheng-1").text();
                var xiu_T = $(".mode-jb-1").find(".mode-word-1").eq(_syindex).find(".shijian-1").text();
                var data_D = $(".mode-jb-1").find(".mode-word-1").eq(_syindex).find(".mingcheng-1").attr("data");

                $(".jbmingcheng").val(zz);
                $(".dhdate1").val(xiu_T);
                $(".jbmingcheng").attr("data",data_D);
                $( ".duihua1" ).dialog( "open" );
            });

            $(".jbmingcheng2-an").bind("click",function () {
                var fzz = $(".jbmingcheng").val();
                var fzz_T=$(".dhdate1").val();
                var blzhi_data = $(".jbmingcheng").attr("data");

                if(fzz.trim() == ""){
                    $(".error1-msg").html("输入框不能为空,请输入有效内容后再提交！");
                    $( ".duihua1-1").focus();
                }else if($(".jbmingcheng").attr("data")=="" || $(".jbmingcheng").attr("data")==null){
                    $(".error1-msg").html("无效病例！");
                }else {
                    var remove = $(this).parent().find('.mingcheng-1').html();
                    var size = s1.size;
                    s1.add(fzz);
                    if (s1.size == size) {
                        $(".error1-msg").html("内容重复，修改后再提交！");
                    } else {
                        $(".error1-msg").html("");
                        $(".mode-jb-1").find(".mode-word-1").eq(_syindex).find(".mingcheng-1").text(fzz);
                        $(".mode-jb-1").find(".mode-word-1").eq(_syindex).find(".shijian-1").text(fzz_T);
                        $(".mode-jb-1").find(".mode-word-1").eq(_syindex).find(".mingcheng-1").attr("data",blzhi_data);
                        s1.delete(remove);
                    }
                }
            });
            /*----------------------------------手术名称 修改-----------------------------------*/
            $("body").on("click",".xiu-2", function(){
                _syindex = $(this).parents(".mode-word-2").index();
                var zz = $(".mode-jb-2").find(".mode-word-2").eq(_syindex).find(".mingcheng-2").text();
                var xiu_T = $(".mode-jb-2").find(".mode-word-2").eq(_syindex).find(".shijian-2").text();
                var data_D = $(".mode-jb-2").find(".mode-word-2").eq(_syindex).find(".mingcheng-2").attr("data");

                $(".ssmingcheng").val(zz);
                $(".dhdate2").val(xiu_T);
                $(".ssmingcheng").attr("data",data_D);
                $( ".duihua2" ).dialog( "open" );
            });

            $(".ssmingcheng2-an").bind("click",function () {
                var fzz = $(".ssmingcheng").val();
                var fzz_T=$(".dhdate2").val();
                var blzhi_data = $(".ssmingcheng").attr("data");

                if(fzz.trim() == ""){
                    $(".error2-msg").html("输入框不能为空,请输入有效内容后再提交！");
                    $( ".duihua2-1").focus();
                }else if($(".ssmingcheng").attr("data")=="" || $(".ssmingcheng").attr("data")==null){
                    $(".error2-msg").html("无效病例！");
                }else {
                    var remove = $(this).parent().find('.mingcheng-2').html();
                    var size = s1.size;
                    s1.add(fzz);
                    if (s1.size == size) {
                        $(".error2-msg").html("内容重复，修改后再提交！");
                    } else {
                        $(".error2-msg").html("");
                        $(".mode-jb-2").find(".mode-word-2").eq(_syindex).find(".mingcheng-2").text(fzz);
                        $(".mode-jb-2").find(".mode-word-2").eq(_syindex).find(".shijian-2").text(fzz_T);
                        $(".mode-jb-2").find(".mode-word-2").eq(_syindex).find(".mingcheng-2").attr("data",blzhi_data);
                        s1.delete(remove);
                    }
                }
            });
            /*----------------------------------药物名称 含(疾病名称 弹窗部分) 修改-----------------------------------*/
            $("body").on("click",".xiu-1", function(){
                _syindex = $(this).parents(".mode-word-1").index();
                var zz = $(".mode-jb-1").find(".mode-word-1").eq(_syindex).find(".mingcheng-1").text();
                var xiu_T = $(".mode-jb-1").find(".mode-word-1").eq(_syindex).find(".shijian-1").text();

                $(".duihua1-1").val(zz);
                $(".dhdate1").val(xiu_T);
                $( ".duihua1" ).dialog( "open" );
            });
            $(".mode-tianjia-1").bind("click",function () {
                $(".duihua1-1-an").show();
                $(".duihua1-2-an").hide();
                $(".jbmingcheng2-an").hide();
            });
            $("body").on("click",".xiu-1",function () {
                $(".duihua1-2-an").show();
                $(".duihua1-1-an").hide();
                $(".jbmingcheng2-an").show();
                $(".jbmingcheng-an").hide();
            });
            $(".duihua1-2-an").bind("click",function () {
                var fzz = $(".duihua1-1").val();
                var fzz_T=$(".dhdate1").val();
                var blzhi_data = $(".duihua1-1").attr("data");

                if(fzz.trim() == ""){
                    $(".error1-msg").html("输入框不能为空,请输入有效内容后再提交！");
                    $( ".duihua1-1").focus();
                }else {
                    var remove = $(this).parent().find('.mingcheng-1').html();
                    var size = s1.size;
                    s1.add(fzz);
                    if (s1.size == size) {
                        $(".error1-msg").html("内容重复，修改后再提交！");
                    } else {
                        $(".error1-msg").html("");
                        $(".mode-jb-1").find(".mode-word-1").eq(_syindex).find(".mingcheng-1").text(fzz);
                        $(".mode-jb-1").find(".mode-word-1").eq(_syindex).find(".shijian-1").text(fzz_T);
                        $(".mode-jb-1").find(".mode-word-1").eq(_syindex).find(".mingcheng-1").attr("data",blzhi_data);
                        s1.delete(remove);
                    }
                }
            });
            /*1删除*/
            $("body").on("click",".shan-1", function(){
                var remove = $(this).parent().find('.mingcheng-1').html();
                s1.delete(remove);
                $(this).parents(".mode-word-1").remove();

            });

            /*----------------------------------食物名称 含（手术名称 弹窗部分）修改-----------------------------------*/
            $("body").on("click",".xiu-2", function(){
                _syindex = $(this).parents(".mode-word-2").index();
                var zz = $(".mode-jb-2").find(".mode-word-2").eq(_syindex).find(".mingcheng-2").text();
                var xiu_T = $(".mode-jb-2").find(".mode-word-2").eq(_syindex).find(".shijian-2").text();

                $(".duihua2-1").val(zz);
                $(".dhdate2").val(xiu_T);
                $( ".duihua2" ).dialog( "open" );
            });
            $(".mode-tianjia-2").bind("click",function () {
                $(".duihua2-1-an").show();
                $(".duihua2-2-an").hide();
                $(".ssmingcheng2-an").hide();
                $(".ssmingcheng-an").show();
            });
            $("body").on("click",".xiu-2",function () {
                $(".duihua2-2-an").show();
                $(".duihua2-1-an").hide();
                $(".ssmingcheng2-an").show();
                $(".ssmingcheng-an").hide();
            });
            $(".duihua2-2-an").bind("click",function () {
                var fzz = $(".duihua2-1").val();
                var fzz_T=$(".dhdate2").val();
                var blzhi_data = $(".duihua2-1").attr("data");

                if(fzz.trim() == ""){
                    $(".error2-msg").html("输入框不能为空,请输入有效内容后再提交！");
                    $( ".duihua2-1").focus();
                }else {
                    var remove = $(this).parent().find('.mingcheng-2').html();
                    var size = s1.size;
                    s2.add(fzz);
                    if (s2.size == size) {
                        $(".error2-msg").html("内容重复，修改后再提交！");
                    } else {
                        $(".error2-msg").html("");
                        $(".mode-jb-2").find(".mode-word-2").eq(_syindex).find(".mingcheng-2").text(fzz);
                        $(".mode-jb-2").find(".mode-word-2").eq(_syindex).find(".shijian-2").text(fzz_T);
                        $(".mode-jb-2").find(".mode-word-2").eq(_syindex).find(".mingcheng-2").attr("data",blzhi_data);
                        s2.delete(remove);
                    }
                }
            });
            /*2删除*/
            $("body").on("click",".shan-2", function(){
                var remove = $(this).parent().find('.mingcheng-2').html();
                s2.delete(remove);
                $(this).parents(".mode-word-2").remove();
            });
            /*----------------------------------外伤名称 修改-----------------------------------*/
            $("body").on("click",".xiu-3", function(){
                _syindex = $(this).parents(".mode-word-3").index();
                var zz = $(".mode-jb-3").find(".mode-word-3").eq(_syindex).find(".mingcheng-3").text();
                var zz2 = $(".mode-jb-3").find(".mode-word-3").eq(_syindex).find(".mingcheng-3").attr("data");
                var xiu_T = $(".mode-jb-3").find(".mode-word-3").eq(_syindex).find(".shijian-3").text();

                $(".duihua3-1").val(zz);
                $(".duihua3-1").val(zz2);
                $(".dhdate3").val(xiu_T);
                $( ".duihua3" ).dialog( "open" );
            });
            $(".mode-tianjia-3").bind("click",function () {
                $(".duihua3-1-an").show();
                $(".duihua3-2-an").hide();
            });
            $("body").on("click",".xiu-3",function () {
                $(".duihua3-2-an").show();
                $(".duihua3-1-an").hide()
            });
            $(".duihua3-2-an").bind("click",function () {
                var fzz = $(".duihua3-1 option:selected").text();
                var fzz_T=$(".dhdate3").val();
                var blzhi_data = $(".duihua3-1").attr("data");
                if( $( ".duihua3-1 option:selected" ).val() == "" ){
                    alert("请选择下拉框");
                    return false;
                }
                if(fzz.trim() == ""){
                    $(".error3-msg").html("输入框不能为空,请输入有效内容后再提交！");
                    $( ".duihua3-1").focus();
                }else {
                    var remove = $(this).parent().find('.mingcheng-3').html();
                    var size = s3.size;
                    s3.add(fzz);
                    if (s3.size == size) {
                        $(".error3-msg").html("内容重复，修改后再提交！");
                    } else {
                        $(".error3-msg").html("");
                        $(".mode-jb-3").find(".mode-word-3").eq(_syindex).find(".mingcheng-3").text(fzz);
                        $(".mode-jb-3").find(".mode-word-3").eq(_syindex).find(".shijian-3").text(fzz_T);
                        $(".mode-jb-3").find(".mode-word-3").eq(_syindex).find(".mingcheng-3").attr("data",blzhi_data);
                        s3.delete(remove);
                    }
                }
            });
            /*3删除*/
            $("body").on("click",".shan-3", function(){
                var remove = $(this).parent().find('.mingcheng-3').html();
                s3.delete(remove);
                $(this).parents(".mode-word-3").remove();
            });
            /*----------------------------------输血原因 修改-----------------------------------*/
            $("body").on("click",".xiu-4", function(){
                _syindex = $(this).parents(".mode-word-4").index();
                var zz = $(".mode-jb-4").find(".mode-word-4").eq(_syindex).find(".mingcheng-4").text();
                var zz2 = $(".mode-jb-4").find(".mode-word-4").eq(_syindex).find(".mingcheng-4").attr("data");
                var xiu_T = $(".mode-jb-4").find(".mode-word-4").eq(_syindex).find(".shijian-4").text();

                $(".duihua4-1.other").val(zz);
                $(".duihua4-1").val(zz2);
                $(".dhdate4").val(xiu_T);
                $( ".duihua4" ).dialog( "open" );
            });
            $(".mode-tianjia-4").bind("click",function () {
                $(".duihua4-1-an").show();
                $(".duihua4-2-an").hide();
                $(".mode-jb-4 .mingcheng-4").each(function(){
                    var buxuan = $(this).attr("data");
                    $(".duihua4-1 [value='"+buxuan+"']").prop('disabled', true);
                });
            });
            $("body").on("click",".xiu-4",function () {
                $(".duihua4-2-an").show();
                $(".duihua4-1-an").hide()
            });
            $(".duihua4-2-an").bind("click",function () {
                var fzz = ($(".duihua4-1 option:selected").text() || $(".duihua4-1").val());
                var fzz_T=$(".dhdate4").val();
                var blzhi_data = $(".duihua4-1").attr("data");
                if( $( ".duihua4-1 option:selected" ).val() == "" ){
                    alert("请选择下拉框");
                    return false;
                }
                if(fzz.trim() == ""){
                    $(".error4-msg").html("输入框不能为空,请输入有效内容后再提交！");
                    $( ".duihua4-1").focus();
                }else {
                    var remove = $(this).parent().find('.mingcheng-4').html();
                    var size = s4.size;
                    s4.add(fzz);
                    if (s4.size == size) {
                        $(".error4-msg").html("内容重复，修改后再提交！");
                    } else {
                        $(".error4-msg").html("");
                        $(".mode-jb-4").find(".mode-word-4").eq(_syindex).find(".mingcheng-4").text(fzz);
                        $(".mode-jb-4").find(".mode-word-4").eq(_syindex).find(".shijian-4").text(fzz_T);
                        $(".mode-jb-4").find(".mode-word-4").eq(_syindex).find(".mingcheng-4").attr("data",blzhi_data);
                        s4.delete(remove);
                    }
                }
            });
            /*4删除*/
            $("body").on("click",".shan-4", function(){
                var remove = $(this).parent().find('.mingcheng-4').html();
                s4.delete(remove);
                $(this).parents(".mode-word-4").remove();
            });


            /*既往史日期(公用时间)*/
            $( ".dhdate1,.dhdate2,.dhdate3,.dhdate4" ).datepicker({dateFormat:'yy-mm-dd'});
            jQuery(function($) {
                $.datepicker.regional['zh-CN'] = {
                    clearText: '清除',
                    clearStatus: '清除已选日期',
                    closeText: '关闭',
                    closeStatus: '不改变当前选择',
                    prevText: '<上月',
                    prevStatus: '显示上月',
                    prevBigText: '<<',
                    prevBigStatus: '显示上一年',
                    nextText: '下月>',
                    nextStatus: '显示下月',
                    nextBigText: '>>',
                    nextBigStatus: '显示下一年',
                    currentText: '今天',
                    currentStatus: '显示本月',
                    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                    monthNamesShort: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],
                    monthStatus: '选择月份',
                    yearStatus: '选择年份',
                    weekHeader: '周',
                    weekStatus: '年内周次',
                    dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
                    dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
                    dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
                    dayStatus: '设置 DD 为一周起始',
                    dateStatus: '选择 m月 d日, DD',
                    dateFormat: 'yy-mm-dd',
                    firstDay: 1,
                    initStatus: '请选择日期',
                    isRTL: false
                };
                $.datepicker.setDefaults($.datepicker.regional['zh-CN']);
            });

            /*-------------------------------提交成功按钮-------------------------------*/

            $(".updata3-r").click(function () {

                if($(".mode-jb-1").html().trim() != ""){
                    $(".mode-word-1 .mingcheng-1").each(function(e){
                        jibings = {
                            requestId: "zwswt_jbmc"//问题ID
                        };
                        jibings.personMasterInfoId =_this.key;
                        jibings.answerId = $(this).attr("data");
                        jibings.answerDate = $(this).siblings(".shijian-1").text();
                        jibing.push(jibings)
                    });
                }
                if($(".mode-jb-2").html().trim() != ""){
                    $(".mode-word-2 .mingcheng-2").each(function(e){
                        jibings = {
                            requestId: "zwswt_ssmc"//问题ID
                        };
                        jibings.personMasterInfoId =_this.key;
                        jibings.answerId = $(this).attr("data");
                        jibings.answerDate = $(this).siblings(".shijian-2").text();
                        jibing.push(jibings)
                    });
                }
                if($(".mode-jb-3").html().trim() != ""){
                    $(".mode-word-3 .mingcheng-3").each(function(e){
                        jibings = {
                            requestId: "zwswt_wsmc"//问题ID
                        };
                        jibings.personMasterInfoId =_this.key;
                        jibings.answerId = $(this).attr("data");
                        jibings.answerDate = $(this).siblings(".shijian-3").text();
                        jibing.push(jibings)
                    });
                }
                if($(".mode-jb-4").html().trim() != ""){
                    $(".mode-word-4 .mingcheng-4").each(function(e){
                        jibings = {
                            requestId: "zwswt_sxyy"//问题ID
                        };
                        jibings.personMasterInfoId =_this.key;
                        jibings.answerId = $(this).attr("data");
                        jibings.answerDate = $(this).siblings(".shijian-4").text();
                        jibing.push(jibings)
                    });
                }else if($(".mode-jb-1").html() == "" && $(".mode-jb-2").html() == "" && $(".mode-jb-3").html() == "" && $(".mode-jb-4").html() == ""){
                    jibings = {
                        personMasterInfoId:_this.key
                    };
                    jibing.push(jibings)
                }

                $.ajax({
                    /*-------------------------------请求服务器-------------------------------*/
                    type: "POST",
                    url: "/apis/file/historyPastIllnessInfo",
                    data: JSON.stringify(jibing),
                    dataType: "json",
                    contentType: 'application/json',
                    success: function (data) {
                        //console.log(jibing);
                        //console.log(jibing);
                        window.location.href="new-document4.html";
                    },
                    error: function () {
                        alert("请求失败");

                    }
                });

            })

        },
        Familyhistory:function () {/*-------------------------------家族史-------------------------------*/
            var _this = this;
            _this.gaoxueya();

            $("input[name=Fruits]:eq(1)").attr("checked",'checked').click();
            var jas_cc = $("input[name='Fruits']:checked").val();

            function zhangtai() {
                if(jas_cc == 0){
                    $(".jz-tb").addClass("closer");
                    $("input[name='jbmc']").prop("disabled",true);
                    $(".jz-qinshu-all").prop("disabled",true);
                    $(".jz-die").prop("disabled",true);
                    $(".jz-benren").prop("disabled",true);
                    $(".addmore").prop("disabled",true).addClass("on");
                    $(".jzs-all-anniu").prop("disabled",true);
                    $(".jzs-all-word").addClass("on");
                    $(".updata7-r").prop("disabled",false).addClass("page-1");
                    $(".jzs-all-word-shanchu").removeClass("on");
                }else {
                    $(".jz-tb").removeClass("closer");
                    $("input[name='jbmc']").prop("disabled",false);
                    $(".jz-qinshu-all").prop("disabled",false);
                    $(".jz-die").prop("disabled",false);
                    $(".jz-benren").prop("disabled",false);
                    $(".addmore").prop("disabled",false).removeClass("on");
                    $(".jzs-all-anniu").prop("disabled",false).addClass("page-1");
                    $(".jzs-all-word").removeClass("on");
                    $(".jzs-all-word-shanchu").addClass("on");
                }
            }
            zhangtai();
            $("input[name='Fruits']").change(function () {
                jas_cc = $("input[name='Fruits']:checked").val();
                //console.log(jas_cc);
                if(jas_cc == 1 && Listening ==0){
                    $(".updata7-r").prop("disabled",true).removeClass("page-1");
                }
                zhangtai();
            });

            /*-------------------------------成功提交---------------------------------------*/
            $("body").on("change",".jz-qinshu",function () {
                $(this).attr("data",$(this).val());
            });
            $("body").on("change",".jz-die",function () {
                $(this).attr("data",$(this).val());
            });
            $("body").on("change",".jz-benren",function () {
                $(this).attr("data",$(this).val());
            });
            /*--------------------------------弹窗------------------------------------------*/
            $( ".jzs-all-anniu" ).click(function() {$( ".duihua5" ).dialog( "open" );$(".duihua1-1,.jz-qinshu,.jz-die,.jz-benren").val("");$(".duihua5-1-an").show()});

            $(".duihua5-1-an").bind("click",function () {
                if($("input[name='jbmc']").val()==""){
                    $(".document-7-error1-msg").text("添加名称!");
                }else if($(".jz-qinshu").val()==""){
                    $(".document-7-error1-msg").text("请选择亲属!");
                }else if($(".jz-die").val()==""){
                    $(".document-7-error1-msg").text("是否存活!");
                }else if($(".jz-benren").val()==""){
                    $(".document-7-error1-msg").text("本人是否罹患!");
                }else if($(".jiazhu").attr("data")=="" || $(".jiazhu").attr("data")==null){
                    $(".error5-msg").html("无效病例!");
                }else {
                    $(".error5-msg").html("");
                    $(".document-7-error1-msg").html("");
                    var jbmc =$("input[name='jbmc']").val();
                    var jbmc_D = $("input[name='jbmc']").attr("data");
                    var qinshu =$(".jz-qinshu option:selected").text();
                    var qinshu_D =$(".jz-qinshu").attr("data");
                    var die =$(".jz-die option:selected").text();
                    var die_D =$(".jz-die").attr("data");
                    var benren =$(".jz-benren option:selected").text();
                    var benren_D =$(".jz-benren").attr("data");

                    $(".jzs-all-word").prepend("<div class='jzs-all-word2'>"+"<div class='jzs-all-word-1' data='"+jbmc_D+"'>"+jbmc+"</div>"+"<div class='jzs-all-word-2' data='"+qinshu_D+"'>"+qinshu+"</div>"+"<div class='jzs-all-word-3' data='"+die_D+"'>"+die+"</div>"+"<div class='jzs-all-word-4' data='"+benren_D+"'>"+benren+"</div>"+"<div class='jzs-all-word-shanchu on'>删除</div>"+"</div>");
                }
            });
            /*--------------------------------删除数据-------------------------------------*/
            $("body").on("click",".jzs-all-word-shanchu.on",function () {
                $(this).parent(".jzs-all-word2").remove();
                family.splice(0,family.length);//清空数组
            });
            /*------------监听-----------*/
            var Listening = 0;
            $(".jzs-all-word").on("DOMNodeInserted", function () {
                Listening++;
                $(".updata7-r").prop("disabled",false).addClass("page-1");
            });
            $(".jzs-all-word").bind("DOMNodeRemoved", function () {
                Listening--;
                if(Listening == 0){
                    $(".updata7-r").prop("disabled",true).removeClass("page-1");
                }
            });
            /*--------------------------------提交数据-------------------------------------*/
            $(".updata7-r").click("click",function () {
                    if(jas_cc==0 || Listening == 0){
                        window.location.href="new-document8.html";
                        familys={
                            personMasterInfoId :_this.key
                        };
                        familys.diseaseId = null;
                        familys.relationshipId = null;
                        familys.death = null;
                        familys.selfHad = null;
                        family.push(familys);
                    }
                    else {
                        $(".jzs-all-word2 .jzs-all-word-1").each(function(e){
                            familys={

                            };
                            familys.personMasterInfoId =_this.key;
                            familys.diseaseId =$(this).attr("data");
                            familys.relationshipId =parseInt($(this).siblings(".jzs-all-word-2").attr("data"));
                            familys.death =parseInt($(this).siblings(".jzs-all-word-3").attr("data"));
                            familys.selfHad =parseInt($(this).siblings(".jzs-all-word-4").attr("data"));
                            //console.log(familys);
                            family.push(familys);
                        });
                    }
                $.ajax({
                    /*-------------------------------请求服务器-------------------------------*/
                    type: "POST",
                    url: "/apis/file/familyHistoryInfo",
                    data: JSON.stringify(family),
                    dataType: "json",
                    contentType: 'application/json',
                    success: function (data) {
                        if(data.returnFlag == 0){
                            window.location.href="new-document8.html";
                        }else if(data.returnFlag == 1 || data.statusCode == 500){
                            _this.public(2,data.data);
                        }
                    },
                    error: function () {
                        alert("请求失败");
                    }
                });
            });

        },
        gaoxueya:function () {/*--------------------------------------高血压情况------------------------------------------*/
            var _this = this;
            _this.tnbqk();
            $("#fenji").change(function () {//分级
                _this.gxy_Grade = $(this).val();
            });
            $("#fenzhu").change(function () {//分组
                _this.gxy_Group = $(this).val();
            });
            $("#gxyny").change(function () {//月年
                _this.gxy_nyr = $(this).val();
            });
            $("#gxylei").change(function () {//高血压类
                _this.gxy_gxyl = $(this).val();
            });
            $("#gxyjctj").change(function () {//检出途径
                _this.gxy_jctj = $(this).val();
            });
            $("input[name='gxy_fuyao']").change(function () {//是否服用降压药
                _this.gxy_take = $(this).val();
            });
            $("input[name='gxy_zixiang']").change(function () {//血压知晓情况
                _this.gxy_zixiang = $(this).val();
                console.log(_this.gxy_zixiang)
            });
            $("input[name='gxy_zhixiaoxue']").change(function () {//血压知晓情况
                _this.gxy_FatSituation = $(this).val();
            });

            _this.targetOrgans=[];
            _this.chronic=[];
            function boxs2(names,attrs) {//复选框 封装
                $("input[name='"+names+"']").change(function () {
                    if($(this).is(":checked") && attrs.indexOf(attrs) == -1){
                        attrs.push($(this).val())
                    }else if(!$(this).is(":checked")){
                        for(var i=0; i<attrs.length; i++){
                            if(attrs[i] === $(this).val()){
                                attrs.splice(i,1)
                            }
                        }
                    }
                    console.log(attrs)
                });
            }
            boxs2("gxy_qiguan",_this.targetOrgans);//靶器官损坏
            boxs2("gxy_gxb",_this.chronic);//患其它慢病

            $("input[name='gxy_xingwei']").change(function () {//遵医行为
                _this.complian = $(this).val();
            });

            $("input[name='gxy_tizhong'],input[name='gxy_shengao']").keyup(function () {//计算BMI（kg/m²）
                _this.height= parseFloat($("input[name='gxy_shengao']").val()).toFixed(2)//身高
                _this.weight= parseFloat($("input[name='gxy_tizhong']").val()).toFixed(2)//体重
                _this.BMI =_this.weight/(_this.height*_this.height);
                $("input[name='gxy_bmi']").val(_this.BMI.toFixed(1));
                if($("input[name='gxy_bmi']").val() == "NaN"){
                    $("input[name='gxy_bmi']").val("")
                }
            });

            $('#gxyform').bootstrapValidator({
                message: '输入值无效！',
                feedbackIcons: {
                    valid: 'glyphicon glyphicon-ok',
                    invalid: 'glyphicon glyphicon-remove',
                    validating: 'glyphicon glyphicon-refresh'
                },
                fields: {
                    ApplyUnit: {
                        validators: {
                            notEmpty: {
                                message: '请选择'
                            }
                        }
                    },
                    gxy_leixing:{
                        validators: {
                            notEmpty: {
                                message: '请选择'
                            }
                        }
                    },
                    gxy_tujing:{
                        validators: {
                            notEmpty: {
                                message: '请选择'
                            }
                        }
                    },
                    gxy_shuihan1:{
                        validators: {
                            notEmpty: {
                                message: '请选择'
                            }
                        }
                    },
                    gxy_shuihan2:{
                        validators: {
                            notEmpty: {
                                message: '请选择'
                            }
                        }
                    },
                    gxy_fuyao:{
                        validators: {
                            notEmpty: {
                                message: '请选择'
                            }
                        }
                    },
                    gxy_zhixiao:{
                        validators: {
                            notEmpty: {
                                message: '请选择'
                            }
                        }
                    },
                    gxy_shengao:{
                        validators: {
                            notEmpty: {
                                message: '请选择'
                            },
                            /*regexp: {
                                regexp: /^(0\.[1-9]|[1-9](\.\d)?|1\d(\.\d)?|2[0-5](\.\d)?)$/g
                            }*/
                        }
                    },
                    gxy_tizhong:{
                        validators: {
                            notEmpty: {
                                message: '请选择'
                            }
                        }
                    },
                    gxy_bmi:{
                        validators: {
                            notEmpty: {
                                message: 'BMI（kg/m²）为必填项'
                            }
                        }
                    }

                }
            }).on("success.form.bv", function (e) {
                e.preventDefault();//阻止默认行为
                gxyqk ={
                    personMasterInfoId: _this.key,//主表ID
                    id:gxy_id//高血压表ID
                };
                gxyqk.conditionGrade= _this.gxy_Grade;//分级
                gxyqk.conditionGroup= _this.gxy_Group;//分组
                gxyqk.visitCount= $("input[name='ApplyUnit']").val();//随访频率 次数
                gxyqk.visitUnit= _this.gxy_nyr; //随访频率 年/月
                gxyqk.hypertensionType=_this.gxy_gxyl;//高血压类
                gxyqk.checkWay=_this.gxy_jctj;//检出途径
                gxyqk.bloodPressureSituation= _this.gxy_zixiang;//血压知晓情况
                gxyqk.bloodPressureLevel= $("input[name='gxy_shuihan1']").val()+"/"+$("input[name='gxy_shuihan2']").val();//未服用降压药前血压水平
                gxyqk.takeAntihypertensiveDrugs= _this.gxy_take;//是否服用降压药
                gxyqk.bloodFatSituation= _this.gxy_FatSituation;//血脂知晓情况
                gxyqk.height= parseFloat($("input[name='gxy_shengao']").val()).toFixed(2)//身高
                gxyqk.weight= parseFloat($("input[name='gxy_tizhong']").val()).toFixed(2)//体重
                gxyqk.bodyMassIndex= parseFloat($("input[name='gxy_bmi']").val()).toFixed(2)//*BMI（kg/m²）
                gxyqk.targetOrganDamageParams= _this.targetOrgans;//靶器官损坏
                gxyqk.chronicDiseaseParams= _this.chronic;//患其它慢病
                gxyqk.complianceBehavior= _this.complian;//遵医行为
                var nextpage = $(".new-left ul li.on").nextAll(".page").attr("data");

                $.ajax({
                    /*-------------------------------请求服务器-------------------------------*/
                    type: "POST",
                    url: "/apis/file/fileHypertensionInfo",
                    data: JSON.stringify(gxyqk),
                    dataType: "json",
                    contentType: 'application/json',
                    success: function (data) {
                        if(typeof (nextpage) == "undefined"){
                            $('#myModal').modal('show');
                            $.ajax({
                                type: "GET",
                                url: "/apis/file/awaitConfirmedMessage/"+_this.key,
                                dataType: "json",
                                success: function(e){
                                    var sex = (e.data.sex== false)?"女":"男";
                                    $(".modal-body").empty();
                                    $(".modal-body").append("姓名:"+e.data.name+"<br>");
                                    $(".modal-body").append("性别:"+sex+"<br>");
                                    $(".modal-body").append("年龄:"+e.data.age+"<br>");
                                    $(".modal-body").append("档案号:"+e.data.fileNumber+"<br>");
                                    $(".modal-body").append("所属人群:"+e.data.slowDiseaseFlag+"<br>");
                                    DiseaseFlag = e.data.slowDiseaseFlag;
                                }
                            });
                        }else {
                            window.location.href=nextpage;
                        }
                    },
                    error: function () {
                        alert("请求失败");
                    }
                });
            });
        },
        tnbqk:function () {/*--------------------------------------糖尿病情况------------------------------------------*/
            var _this = this;
            _this.fjhqk();
            $("#tnb_nyn").change(function () {//随访频率(年)
                _this.tnb_nyn = $(this).val();
            });
            $("#tnb_leixing").change(function () {//糖尿病类型
                _this.tnb_leixing = $(this).val();
            });
            $("#tnb_tuijing").change(function () {//检出途径
                _this.tnb_tuijing = $(this).val();
            });
            $("input[name='tnb_zhixiao']").change(function () {//糖尿病知晓情况
                _this.tnb_zhixiao =$(this).val();
            });
            $("input[name='tnb_fuyao']").change(function () {//是否服药
                _this.tnb_fuyao =$(this).val();
            });


            _this.tnb_bingfa=[];
            function boxs2(names,attrs) {//复选框 封装
                $("input[name='"+names+"']").change(function () {
                    if($(this).is(":checked") && attrs.indexOf(attrs) == -1){
                        attrs.push($(this).val())
                    }else if(!$(this).is(":checked")){
                        for(var i=0; i<attrs.length; i++){
                            if(attrs[i] === $(this).val()){
                                attrs.splice(i,1)
                            }
                        }
                    }
                    console.log(attrs)
                });
            }
            boxs2("tnb_bingfa",_this.tnb_bingfa);//并发症


            $("input[name='tnb_xingwei']").change(function () {//遵医行为
                _this.tnb_xingwei =$(this).val();
            });

            $('#tnbForm').bootstrapValidator({
                message: '输入值无效！',
                feedbackIcons: {
                    valid: 'glyphicon glyphicon-ok',
                    invalid: 'glyphicon glyphicon-remove',
                    validating: 'glyphicon glyphicon-refresh'
                },
                fields: {
                    tnb_pinlv: {
                        validators: {
                            notEmpty: {
                                message: '请选择一个商品'
                            }
                        }
                    }
                }
            }).on("success.form.bv", function (e) {
                e.preventDefault();//阻止默认行为
                tnbqk ={
                    id:tnb_id,//当前表ID
                    personMasterInfoId:_this.key//主表ID
                };
                tnbqk.visitCount= $("input[name='tnb_pinlv']").val();//随访频率 次数
                tnbqk.visitUnit= _this.tnb_nyn;//随访频率 年/月/周
                tnbqk.diabetesType= _this.tnb_leixing;//糖尿病类型
                tnbqk.checkWay= _this.tnb_tuijing;//检出途径
                tnbqk.bloodSugarSituation= _this.tnb_zhixiao;//糖尿病知晓情况
                tnbqk.emptyBloodSugar= $("input[name='tnb_xuetang']").val();//未服用降糖药前血糖水平 空腹
                tnbqk.randomBloodSugar= $("input[name='tnb_shuji']").val();//未服用降糖药前血糖水平 随机
                tnbqk.medication= _this.tnb_fuyao;//是否服药
                tnbqk.complicationParams= _this.tnb_bingfa;//并发症
                tnbqk.complianceBehavior= _this.tnb_xingwei;//遵医行为
                console.log(tnbqk.complianceBehavior);
                var nextpage = $(".new-left ul li.on").nextAll(".page").attr("data");
                console.log(nextpage);

                $.ajax({
                    /*-------------------------------请求服务器-------------------------------*/
                    type: "POST",
                    url: "/apis/file/fileDiabetesInfo",
                    data: JSON.stringify(tnbqk),
                    dataType: "json",
                    contentType: 'application/json',
                    success: function (data) {
                        if(typeof (nextpage) == "undefined"){
                            $('#myModal').modal('show');
                            $.ajax({
                                type: "GET",
                                url: "/apis/file/awaitConfirmedMessage/"+_this.key,
                                dataType: "json",
                                success: function(e){
                                    var sex = (e.data.sex== false)?"女":"男";
                                    $(".modal-body").empty();
                                    $(".modal-body").append("姓名:"+e.data.name+"<br>");
                                    $(".modal-body").append("性别:"+sex+"<br>");
                                    $(".modal-body").append("年龄:"+e.data.age+"<br>");
                                    $(".modal-body").append("档案号:"+e.data.fileNumber+"<br>");
                                    $(".modal-body").append("所属人群:"+e.data.slowDiseaseFlag+"<br>");
                                    DiseaseFlag = e.data.slowDiseaseFlag;
                                }
                            });
                        }else {
                            window.location.href=nextpage;
                        }
                    },
                    error: function () {
                        alert("请求失败");
                    }
                });
            });
        },
        fjhqk:function () {/*--------------------------------------肺结核情况------------------------------------------*/
            var _this = this;
            _this.jingshen();
            $("#fjh_nyn").change(function () {//随访频率(年)
                _this.fjh_nyn = $(this).val();
            });
            $("#fjh_leixing").change(function () {//肺结核类型
                _this.fjh_leixing = $(this).val();
            });
            $("#fjh_tuijing").change(function () {//检出途径
                _this.fjh_checkWay = $(this).val();
            });

            _this.fjh_zhengzhuang=[];
            _this.fjh_hbzs=[];
            function boxs2(names,attrs) {//复选框 封装
                $("input[name='"+names+"']").change(function () {
                    if($(this).is(":checked") && attrs.indexOf(attrs) == -1){
                        attrs.push($(this).val())
                    }else if(!$(this).is(":checked")){
                        for(var i=0; i<attrs.length; i++){
                            if(attrs[i] === $(this).val()){
                                attrs.splice(i,1)
                            }
                        }
                    }
                    console.log(attrs)
                });
            }
            boxs2("fjh_zhengzhuang",_this.fjh_zhengzhuang);//症状
            boxs2("fjh_hbzs",_this.fjh_hbzs);//合并症

            $("input[name='fjh_ggn']").change(function () {//肝功能检测
                _this.fjh_ggn = $(this).val();
            });
            $("input[name='fjh_fangan']").change(function () {//化疗方案
                _this.fjh_fangan = $(this).val();
            });
            $("input[name='fjh_xingwei']").change(function () {//遵医行为
                _this.fjh_xingwei = $(this).val();
            });

            $("input[name='fjh_tizhong'],input[name='fjh_shengao']").keyup(function () {//计算BMI（kg/m²）
                _this.fjh_height= parseFloat($("input[name='fjh_shengao']").val()).toFixed(2)//身高
                _this.fjh_weight= parseFloat($("input[name='fjh_tizhong']").val()).toFixed(2)//体重
                _this.fjh_BMI =_this.fjh_weight/(_this.fjh_height*_this.fjh_height);
                $("input[name='fjh_BMI']").val(_this.fjh_BMI.toFixed(1));
                if($("input[name='fjh_BMI']").val() == "NaN"){
                    $("input[name='fjh_BMI']").val("")
                }
            });

            $('#fjhForm').bootstrapValidator({
                message: '输入值无效！',
                feedbackIcons: {
                    valid: 'glyphicon glyphicon-ok',
                    invalid: 'glyphicon glyphicon-remove',
                    validating: 'glyphicon glyphicon-refresh'
                },
                fields: {
                    fjh_pinlv: {
                        validators: {
                            notEmpty: {
                                message: '请选择一个商品'
                            }
                        }
                    }
                }
            }).on("success.form.bv", function (e) {
                e.preventDefault();//阻止默认行为
                fjhqk ={
                    id:fjh_id,
                    personMasterInfoId:_this.key //主表ID
                };
                fjhqk.visitCount= $("input[name='fjh_pinlv']").val();//随访频率 次数
                fjhqk.visitUnit= _this.fjh_nyn;//随访频率 年/月/周
                fjhqk.pulmonaryTuberculosisType= _this.fjh_leixing;//肺结核类型
                fjhqk.checkWay= _this.fjh_checkWay;//检出途径
                fjhqk.symptomParams= _this.fjh_zhengzhuang;//症状
                fjhqk.complicationParams= _this.fjh_hbzs;//合并症
                fjhqk.height= parseFloat($("input[name='fjh_shengao']").val()).toFixed(2)//身高parseFloat($("input[name='gxy_shengao']").val()).toFixed(2)/
                fjhqk.weight= parseFloat($("input[name='fjh_tizhong']").val()).toFixed(2)//体重
                fjhqk.bodyMassIndex= parseFloat($("input[name='fjh_BMI']").val()).toFixed(2)//BMI（kg/m²）
                fjhqk.liverFunctionCheck= _this.fjh_ggn;//肝功能检测
                fjhqk.chemotherapyPlan= _this.fjh_fangan;//化疗方案
                fjhqk.complianceBehavior= _this.fjh_xingwei;//遵医行为
                var nextpage = $(".new-left ul li.on").nextAll(".page").attr("data");
                console.log(nextpage)
                $.ajax({
                    /*-------------------------------请求服务器-------------------------------*/
                    type: "POST",
                    url: "/apis/file/filePulmonaryTuberculosisInfo",
                    data: JSON.stringify(fjhqk),
                    dataType: "json",
                    contentType: 'application/json',
                    success: function (data) {
                        if(typeof (nextpage) == "undefined"){
                            $('#myModal').modal('show');
                            $.ajax({
                                type: "GET",
                                url: "/apis/file/awaitConfirmedMessage/"+_this.key,
                                dataType: "json",
                                success: function(e){
                                    var sex = (e.data.sex== false)?"女":"男";
                                    $(".modal-body").empty();
                                    $(".modal-body").append("姓名:"+e.data.name+"<br>");
                                    $(".modal-body").append("性别:"+sex+"<br>");
                                    $(".modal-body").append("年龄:"+e.data.age+"<br>");
                                    $(".modal-body").append("档案号:"+e.data.fileNumber+"<br>");
                                    $(".modal-body").append("所属人群:"+e.data.slowDiseaseFlag+"<br>");
                                    DiseaseFlag = e.data.slowDiseaseFlag;
                                }
                            });
                        }else {
                            window.location.href=nextpage;
                        }
                    },
                    error: function () {
                        alert("请求失败");
                    }
                });
            });
        }
        ,
        jingshen:function () {/*--------------------------------------精神病情况------------------------------------------*/
            var _this = this;
            $("#jsbday").change(function () {//随访频率(年)
                _this.jsb_jsbday = $(this).val();
            });
            $("#jsbguanxi").change(function () {//与患者关系
                _this.jsb_guanxi = $(this).val();
            });
            $("#jsb_sheng").change(function () {//监护人住址(省)
                _this.jsb_ProvinceId = $(this).val();
            });
            $("#jsb_shi").change(function () {//监护人住址(市)
                _this.jsb_CityId = $(this).val();
            });
            $("#jsb_qu").change(function () {//监护人住址(区)
                _this.jsb_AreaId = $(this).val();
            });
            $("input[name='jsbzz_qt']").keyup(function () {
                $(".jsbqt").val("其它"+$("input[name='jsbzz_qt']").val());
            });

            $("input[name='jsbqingkuang']").change(function () {//既往治疗情况
                _this.Department =$(this).val();
            });
            /*初次发病时间*/
            $( ".jsbtime" ).datepicker({
                dateFormat:'yy-mm-dd',
                changeMonth: true,
                changeYear: true
            });
            var date=new Date;
            var year=date.getFullYear();
            var month=date.getMonth()+1;
            var tian=date.getDate();
            month =(month<10 ? "0"+month:month);
            var jd_date = (year.toString()+"-"+month.toString()+"-"+tian.toString());
            $(".jsbtime").val(jd_date);
            /*诊断日期*/
            $( ".jsbriqi" ).datepicker({
                dateFormat:'yy-mm-dd',
                changeMonth: true,
                changeYear: true
            });
            $(".jsbriqi").val(jd_date);
            $("input[name='jsbzlxg']").change(function () {//最近一次治疗效果
                _this.Effect =$(this).val();
            });
            $("input[name='jsbyingxiang']").change(function () {//患病对家庭社会的影响
                _this.Situation = $(this).val();
                _this.EffectCount = $(this).siblings("input[name='jsbyingxiang02']").val();
            });
            $("input[name='jsbyingxiang02']").blur(function () {//患病对家庭社会的影响
                _this.EffectCount = $('input[type="radio"][name="jsbyingxiang"]:checked').siblings("input[name='jsbyingxiang02']").val();
            });
            $("input[name='jsbguanjian']").change(function () {//关锁情况
                _this.LockSituation = $(this).val();
            });
            $("input[name='jsbyingwei']").change(function () {//遵医行为
                _this.Behavior = $(this).val();
            });

            $(".doc-updata-all-12").bind("click",function () {//完成提交弹窗
                var baocuns ={
                    personMasterInfoId:_this.key,
                    slowDiseaseFlag: DiseaseFlag
                };
                $.ajax({
                    /*-------------------------------请求服务器-------------------------------*/
                    type: "POST",
                    url: "/apis/file/save",
                    data: JSON.stringify(baocuns),
                    dataType: "json",
                    contentType: 'application/json',
                    success: function (data) {
                        $(".baochun").dialog('close');
                        _this.public(1);
                    },
                    error: function () {
                        alert("请求失败");
                    }
                });
                $('#myModal').modal('hide');
            });
            $('#myModal').on('hide.bs.modal', function () {//完成提交弹窗
                $(".page-s").attr("disabled",false);
            });
            $('#jsbform').bootstrapValidator({
                message: '输入值无效！',
                feedbackIcons: {
                    valid: 'glyphicon glyphicon-ok',
                    invalid: 'glyphicon glyphicon-remove',
                    validating: 'glyphicon glyphicon-refresh'
                },
                fields: {
                    jsbpinlv:{
                        validators: {
                            notEmpty: {
                                message: '请选择'
                            }
                        }
                    },
                    jsbphone:{
                        validators: {
                            notEmpty: {
                                message: '请选择'
                            },
                            regexp: {
                                regexp: /^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/,
                                message: '请输入正确的手机号码'
                            }
                        }
                    }
                }
            }).on("success.form.bv", function (e) {
                e.preventDefault();//阻止默认行为
                jsbqk ={
                    id:jsb_id,
                    personMasterInfoId:_this.key//主表ID
                };
                _this.SymptomParams=[];//既往主要症状-保存其他
                $(".jsb-all-left-3-2 .jsb-list4 input[name='jsbzz']:checked").each(function () {//既往主要症状-保存其他
                    _this.SymptomParams.push($(this).val());
                });
                _this.EffectCount = $('input[type="radio"][name="jsbyingxiang"]:checked').siblings("input[name='jsbyingxiang02']").val();//患病对家庭社会的影响 返回数据保存
                jsbqk.visitCount = $("input[name='jsbpinlv']").val();//随访频率
                jsbqk.visitUnit = _this.jsb_jsbday;//随访频率(年)
                jsbqk.guardianName = $("input[name='jsbname']").val();//监护人姓名
                jsbqk.patientRelationship = _this.jsb_guanxi;//与患者关系
                jsbqk.guardianProvinceId = _this.jsb_ProvinceId;//监护人住址(省)
                jsbqk.guardianCityId = _this.jsb_CityId;//监护人住址(市)
                jsbqk.guardianAreaId = _this.jsb_AreaId;//监护人住址(区)
                jsbqk.guardianAddressDetail = $("input[name='jsbdizhi']").val();//监护人住址(详)
                jsbqk.guardianTelephone = $("input[name='jsbphone']").val();//监护人电话
                jsbqk.firstMorbidityDateStr = $("input[name='jsbtime']").val();//初次发病时间
                jsbqk.pastMainSymptomParams = _this.SymptomParams;//既往主要症状
                jsbqk.pastTreatmentDepartment = _this.Department;//既往治疗情况(门诊)
                jsbqk.pastTreatmentCount = $("input[name='jsbzhuyuan']").val();//既往治疗情况(住院)
                jsbqk.latelyDiagnosisDisease = $("input[name='jsbzhenduan']").val();//最近诊断情况(诊断)
                jsbqk.latelyDiagnosisHospital = $("input[name='jsbyiyuan']").val();//最近诊断情况(诊断医院)
                jsbqk.latelyDiagnosisTimeStr = $("input[name='jsbriqi']").val();//最近诊断情况(日期)
                jsbqk.latelyDiagnosisEffect = _this.Effect;//最近一次治疗效果
                jsbqk.familyEffectSituation = _this.Situation;//患病对家庭社会的影响
                jsbqk.familyEffectCount = _this.EffectCount;//患病对家庭社会的影响(次数)
                jsbqk.closeLockSituation = _this.LockSituation;//关锁情况
                jsbqk.complianceBehavior = _this.Behavior;//遵医行为

                //console.log("值："+jsbqk.familyEffectCount);

                $.ajax({
                    /*-------------------------------请求服务器-------------------------------*/
                    type: "POST",
                    url: "/apis/file/fileMentalDiseaseInfo",
                    data: JSON.stringify(jsbqk),
                    dataType: "json",
                    contentType: 'application/json',
                    success: function (data) {
                        $('#myModal').modal('show');
                        $.ajax({
                            type: "GET",
                            url: "/apis/file/awaitConfirmedMessage/"+_this.key,
                            dataType: "json",
                            success: function(e){
                                var sex = (e.data.sex== false)?"女":"男";
                                $(".modal-body").empty();
                                $(".modal-body").append("姓名:"+e.data.name+"<br>");
                                $(".modal-body").append("性别:"+sex+"<br>");
                                $(".modal-body").append("年龄:"+e.data.age+"<br>");
                                $(".modal-body").append("档案号:"+e.data.fileNumber+"<br>");
                                $(".modal-body").append("所属人群:"+e.data.slowDiseaseFlag+"<br>");
                                DiseaseFlag = e.data.slowDiseaseFlag;
                            }
                        });
                    },
                    error: function () {
                        alert("请求失败");
                    }
                });
            });
        },
        public:function (e,text) {//公共方法集合
            if(e ==1){
                $("body").append("<div class='successfully'><span class='glyphicon glyphicon-ok green'></span>"+"<span class='successfully-text'>"+"提交成功"+"</span>"+"<div>");
                function opens() {
                    var EndTime= 2;
                    var times =setInterval(function () {
                        EndTime --;
                        if(parseInt(EndTime) ==0){
                            clearTimeout(times);
                            $(".successfully").remove();
                        }
                    },1000)
                }
                opens();
            }if( e == 2){
               $("body").append("<div class='opens-win'>"+text+"<div>");
                var EndTime= 4;
                var times =setInterval(function () {
                    EndTime --;
                    if(parseInt(EndTime) ==0){
                        clearTimeout(times);
                        $(".opens-win").remove();
                    }
                },1000)
            }
        }


    };
    window.FindSure = FindSure;
})(jQuery);