����utils/util.js



����1��

	var util = require('../../utils/util.js');
	var app=getApp();
	//����classд����
	var p=new util.Person();
	p.say();
	Page({
	  data: {
		logs: []
	  },
	  onLoad: function () {
		//����GETֻ��Ҫ���� method:'GET'
		util.ajax(app.rooturl+'home/index/index',{method:'POST',data:{age:20,name:'luyan'}}).
		then(function(data){
		   console.log(data);
		   return 'a';
		})
	   .then(function(data){
		  console.log(data);
		  return 'c';
	   }).then(function(data){
			console.log(data);
	   }).catch(error => console.log(error));
		
	  }
	})

����2��
	var util = require('../../utils/util.js');
	var app=getApp();
	//����classд����
	var p=new util.Person();
	p.say();
	Page({
	  data: {
		logs: []
	  },
	  onLoad: function () {
		//����GETֻ��Ҫ���� method:'GET'
		util.ajax(app.rooturl+'home/index/index',{method:'GET',data:{age:20,name:'luyan'}}).
		then(function(data){
		   console.log(data);
		   return 'a';
		})
	   .then(function(data){
		  console.log(data);
		  return 'c';
	   }).then(function(data){
			console.log(data);
	   }).catch(error => console.log(error));
		
	  }
	})
	
	
����3��Ĭ����get
	
	var util = require('../../utils/util.js');
	var app=getApp();
	//����classд����
	var p=new util.Person();
	p.say();
	Page({
	  data: {
		logs: []
	  },
	  onLoad: function () {
		//����GETֻ��Ҫ���� method:'GET'
		util.ajax(app.rooturl+'home/index/index').
		then(function(data){
		   console.log(data);
		   return 'a';
		})
	   .then(function(data){
		  console.log(data);
		  return 'c';
	   }).then(function(data){
			console.log(data);
	   }).catch(error => console.log(error));
		
	  }
	})