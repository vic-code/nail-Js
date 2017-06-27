/*
* @Author: lenovo
* @Date:   2017-04-20 17:01:08
* @Last Modified by:   lenovo
* @Last Modified time: 2017-06-01 09:48:10
*/

'use strict';

(function($){
	$.fn.extend({
		nail:function(options){
			var oNail=this;
			var defaults={
				nailBrother:oNail.siblings(), // 钉子的同辈元素   optional
				nailWrap:oNail.parent(),  // 钉子的父元素 	optional
				direction:'left', // 你要钉在左边还是右边	'left' | 'right'
				topOffset:0,   // 顶部偏移 (距离顶部还有多少像素时就开始钉？)
				onlyTop:false,  // 简单模式 (只判断顶部底部距离钉，不钉在页面底部) false | true
				bottomOffset:0,// 底部统称 (距离底部还有多少像素时又开始钉？)
				defaultCall:null, // 滚动到默认位置回调
				fixedCall:null, // 滚动到固定位置回调
				floorCall:null	// 滚动到底部位置回调
			}
			var options=$.extend(defaults,options||{});

			var oNailTotop=oNail.offset().top,
				oNailHei=oNail.outerHeight(),
				$win=$(window),
				oldSTop=$win.scrollTop();

			// 如果旁边的内容高大于钉子高度，才执行
			if(options.nailBrother.height()>oNailHei){
				//当窗口被拉伸时
				$win.resize(function(){
					if(oNail.attr('style')){
						if(oNail.attr('style').indexOf('fixed')>0){
							oNail.css(options.direction, $(window).width()-options.nailWrap.width()-options.nailWrap.offset().left );
						}else{
							oNail.css(options.direction, 0);
						}
					}
				});

				// 当窗口被滚动时
				$win.scroll(function(){
					var newSTop=$win.scrollTop();
					var _nail={
						high:function(nNailOffset){
							var position={
								fixed:{
									floor:function(){  // fixed
										var fixedNum=($win.width()-options.nailWrap.width())/2,
											fixedStyle='position:fixed; top:auto;bottom: '+options.bottomOffset+'px; '+options.direction+':'+fixedNum+'px';
										oNail.attr('style',fixedStyle);
									},	
									ceil:function(){
										var fixedNum=($win.width()-options.nailWrap.width())/2,
											fixedStyle='position:fixed; top:auto;top: '+options.topOffset+'px; '+options.direction+':'+fixedNum+'px';
										oNail.attr('style',fixedStyle);
									}	
								},
								absolute:{
									floor:function(){
										var absoluteStyle='position:absolute;'+options.direction+':0;top:auto; bottom:'+options.bottomOffset+'px';
										oNail.attr('style',absoluteStyle);
									},
									ceil:function(){
										var absoluteStyle='position:absolute;'+options.direction+':0;top:'+(oNail.offset().top-options.nailBrother.offset().top)+'px; bottom:auto';
				                        oNail.attr('style',absoluteStyle);
									}
								}
							}

							var nNailBrotherOffset=options.nailBrother.outerHeight()-$win.height();

							//nailBrother 进入底部
							if(newSTop>=options.nailBrother.offset().top+nNailBrotherOffset){
								position.absolute.floor();
								return;
							}

							// nailBrother 进入顶部
							if(newSTop>=options.nailBrother.offset().top){
								if(oldSTop>newSTop){  //向上滚动
									if(newSTop >= oNail.offset().top){  // oNail 进入顶部
										position.absolute.ceil();
									}else{
										position.fixed.ceil();
									}
								}else{
									if(newSTop>=oNail.offset().top+nNailOffset){
										position.fixed.floor();
									}else{
										position.absolute.ceil();
									}
								}
							}
							oldSTop=newSTop;
						},

						short:function(){
							var position={
								fixed:{
									ceil:function(){
										var fixedNum=($win.width()-options.nailWrap.width())/2,
											fixedStyle='position:fixed;bottom:auto;top:'+options.topOffset+'px; '+options.direction+':'+fixedNum+'px';
										oNail.attr('style',fixedStyle);
									},
									absolute:{
										floor:function(){
											var absoluteStyle='position:absolute;'+options.direction+':0;top:auto; bottom:'+options.bottomOffset+'px';
				                        	oNail.attr('style',absoluteStyle);
										}
									}
								}
							}

							var offsetFloor=options.nailBrother.outerHeight()+options.nailBrother.offset().top-(oNailHei+options.topOffset)-options.bottomOffset;
							if(offsetFloor>newSTop || options.onlyTop){
								position.fixed.ceil();
								if(options.fixedCall && typeof options.fixedCall==='function'){
			                    	options.fixedCall(oNail);
			                    }
							}else{
								position.absolute.floor();
								if(options.floorCall && typeof options.floorCall==='function'){
			                    	options.floorCall(oNail);
			                    }
							}
						},
						default:function(){
							var defaultStyle='position:absolute;'+options.direction+':0;';
							oNail.attr('style',defaultStyle);

							if(options.defaultCall && typeof options.defaultCall === 'function'){
		                    	options.defaultCall(oNail);
		                    }	
						}
					}

					var nNailOffset=oNailHei-$win.height();
					// 元素高度 > 屏幕高度时
					if(nNailOffset>0){
						// oNail进入顶部
						if(newSTop>=oNailTotop){
							_nail.high(nNailOffset);
							return;
						}
						_nail.default();
						//元素高度<=屏幕高度时
					}else{
						if(newSTop>=oNailTotop-options.topOffset){
	                		_nail.short();
	                	}else{
	                		_nail.default();
	                	}
					}
				});
			}
			return oNail;
		}
	});
})(jQuery);