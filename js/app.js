/**
 * Created by wuzebo on 2017/7/27.
 */
var admin_id =sessionStorage.getItem("admin_id");
var app = angular.module('myApp', []);
app.controller('siteCtrl', function($scope, $http) {
    $http({
        method: 'GET',
        url: "apis/user/navigationBar/"+admin_id
    }).then(function successCallback(e) {
        $scope.names = e.data.data.档案中心;
        $scope.xingzheng = e.data.data.行政区域管理;
        $scope.quanxian = e.data.data.权限管理;
        $scope.dh1 = e.data.data.档案中心[0].fatherName;
        $scope.dh2 = e.data.data.行政区域管理[0].fatherName;
        $scope.dh3 = e.data.data.权限管理[0].fatherName;
    }, function errorCallback(response) {
        // 请求失败执行代码
    });
});
