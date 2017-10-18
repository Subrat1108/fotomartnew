"use strict";
var app = angular.module('fotoMart', ['ngRoute', 'ngResource','ngFileUpload','ngCookies']).run(function($http, $rootScope,$cookieStore) {
	// $rootScope.authenticated = false;
  // $rootScope.current_user = 'Guest';
  var id = $cookieStore.get('authentication');
  console.log(id);
  if(id = true){
    $rootScope.authenticated = $cookieStore.get('authentication');
    $rootScope.current_user = $cookieStore.get('username');
    $rootScope.current_user_id = $cookieStore.get('userId');
  }
  else{
    $rootScope.authenticated = false    
    $rootScope.current_user = "Guest"
}

	$rootScope.signout = function(){
    $http.get('auth/signout');
		$rootScope.authenticated = false;
    $rootScope.current_user = 'Guest';
    $cookieStore.remove('userId');
    $cookieStore.remove('username');
    $cookieStore.remove('authentication');
	};
});

app.config(function($routeProvider){
    $routeProvider
    .when('/', {
			templateUrl: 'main.html',
			controller: 'mainController'
		})
		
		.when('/login', {
			templateUrl: 'login.html',
			controller: 'authController'
		})
		
		.when('/register', {
			templateUrl: 'register.html',
			controller: 'authController'
		})

        .when('/community',{
            templateUrl: 'community.html',
            controller: 'forumController'
        })

        .when('/competition',{
            templateUrl: 'competition.html',
            controller: 'competitionController'
        })

        .when('/userProfile',{
            templateUrl: 'userProfile.html',
            controller: 'profileController'
        })
        .when('/cart',{
            templateUrl: 'cart.html',
            controller: 'cartController'
        });       
    
});



app.controller("forumController", function($scope,thoughtService,$rootScope){

$scope.thoughts = thoughtService.query();
  
$scope.thoughtUpload = function() { 
  thoughtService.save({post : $scope.post, created_by: $rootScope.current_user,created_at : Date.now()},
    function(){
      $scope.post = "";
      $scope.thoughts = thoughtService.query();
      
    }
  );
}

});

/************************************************/

app.controller('authController', function($scope, $http, $rootScope, $location,$cookieStore){
  $scope.user = {username: '', password: ''};
  $scope.error_message = '';

  $scope.login = function(){
    $http.post('/auth/login', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        // $rootScope.current_user = data.user.username;
        // $rootScope.current_user_id = data.user._id;
        $cookieStore.put("username", data.user.username);
        $cookieStore.put("userId", data.user._id);
        $cookieStore.put("authentication", true);
        $rootScope.authenticated = $cookieStore.get('authentication');
        console.log($cookieStore.get('username'));
        $rootScope.current_user = $cookieStore.get('username');
        $rootScope.current_user_id = $cookieStore.get('userId');
        $location.path('/');
        
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };

  $scope.register = function(){
    $http.post('/auth/signup', $scope.user).success(function(data){
      if(data.state == 'success'){
        // $rootScope.authenticated = true;
        // $rootScope.current_user = data.user.username;
        $cookieStore.put("username", data.user.username);
        $cookieStore.put("authentication", true);
        $rootScope.authenticated = $cookieStore.get('authentication');
        $rootScope.current_user = $cookieStore.get('username');
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };

 });

/************************************************/

app.controller("mainController", function($scope,Upload,$http,$rootScope){

  $http.get('/api/picUpload/').then(function(response){
    console.log(response.data);
    $scope.uploads = response.data;
  });

  function sticky_relocate() {
    var window_top = $(window).scrollTop();
    var div_top = $('#sticky-anchor').offset().top;
    if (window_top > div_top) {
        $('#sticky').addClass('stick');
        $('#sticky-anchor').height($('#sticky').outerHeight());
    } else {
        $('#sticky').removeClass('stick');
        $('#sticky-anchor').height(0);
    }
}

  $(function() {
    $(window).scroll(sticky_relocate);
    sticky_relocate();
});
   
  $scope.loading = false;   

  $scope.submit = function(){
    $scope.upload.current_user = $rootScope.current_user;
    $scope.loading = true; 
    Upload.upload({
      url: '/api/picUpload/',
      method: 'post',
      data: $scope.upload
    }).then(function (response) {
      console.log(response.data);
      $scope.uploads.push(response.data);
      $scope.upload = {};
    }).then(function (){$http.get('/api/picUpload/').then(function(response){
      console.log(response.data);
      $scope.uploads = response.data;
      $scope.loading = false; 
    });}
  )
}

  $scope.readData = function(data){
    $scope.filePath = data;
  }

  $scope.modalContents = function(data){
    $rootScope.modalContent = data;   
  }
  
  $scope.downloadFile = function(){
    var fileContent = $rootScope.modalContent;
    console.log(fileContent);
    var uuid = $rootScope.modalContent.file.filename;
    console.log(uuid);
    var filename = $rootScope.modalContent.file.originalname;
    console.log(filename);
    $http.get('/api/picUpload/'+uuid+'/'+filename).then(function(response,error){
      if (error){
        console.log(error);
      }
    });
  }

});

/************************************************/

app.controller("competitionController", function($scope){

});

/************************************************/

app.controller("profileController", function($scope,settingService,$rootScope,$http,Upload){



  $scope.subView = "userPortfolio.html";

  $scope.viewSetter1 = function(){
    $scope.subView = "userPortfolio.html";
  };
  $scope.viewSetter2 = function(){
    $scope.subView = "userfollowings.html";
  };
  $scope.viewSetter3 = function(){
    $scope.subView = "userFollowers.html";
  };
  $scope.viewSetter4 = function(){
    $scope.subView = "userSettings.html";
  };

  $scope.settings = {
    changedPassword :'',
    changedPassword2 : ''
  };

  $scope.error_message = '';

  $scope.settingsUpdate = function(){
    console.log("reached settingUpdate function");
    settingService.save({ password : $scope.changedPassword});
    console.log("called settingService");
  };

  $scope.userUploads = {};

  $http.get('/api/picUpload/'+$rootScope.current_user).then(function(response){
    console.log(response.data);
    $scope.userUploads = response.data;
  });

  $scope.modalContents = function(data){
    $rootScope.userData = data; 
  };

  $scope.deleteFile = function(){
    $http.delete('/api/picUpload/'+$rootScope.userData._id).then(function(response,error){
      if (error){
        console.log(error);
      }
    }).then(function(){
      $http.get('/api/picUpload/'+$rootScope.current_user).then(function(response){
        console.log(response.data);
        $scope.userUploads = response.data;
      });
    });
  };


$scope.changePic = function(){
  Upload.upload({
    url: '/api/profilePic/'+$rootScope.current_user_id,
    method: 'post',
    data: $scope.DP
  }).then(function (response) {
    console.log(response.data);
    $scope.DP.push(response.data);
    $scope.DP = {};
  }).then(function (){$http.get('/profilePic/'+$rootScope.current_user_id).then(function(response){
    console.log(response.data);
    $scope.DP = response.data;
  });
 });
}

});

/************************************************/

app.controller("cartController", function($scope){

});

/***************************Services************************************* */

app.factory('settingService', function($resource, $rootScope){
  return $resource('/api/settings/'+ $rootScope.current_user_id);
});

app.factory('thoughtService', function($resource, $rootScope){
  return $resource('/api/thoughts/:id');
});

app.factory('userService', function($resource, $rootScope){
  return $resource('/api/picUpload/user');
});