/*
 * [y] hybris Platform
 *
 * Copyright (c) 2000-2016 SAP SE or an SAP affiliate company.
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of SAP
 * ("Confidential Information"). You shall not disclose such Confidential
 * Information and shall use it only in accordance with the terms of the
 * license agreement you entered into with SAP.
 */
ACC.imagegallery = {

	_autoload: [
		"bindImageGallery"
	],

	bindImageGallery: function (){

		$(".js-gallery").each(function(){
			var $image = $(this).find(".js-gallery-image");
			var $carousel = $(this).find(".js-gallery-carousel")
			var imageTimeout;

			
			$image.owlCarousel({
				singleItem : true,
				pagination:true,
				navigation:true,
				lazyLoad:true,
				navigationText : ["<span class='glyphicon glyphicon-chevron-left'></span>", "<span class='glyphicon glyphicon-chevron-right'></span>"],
				afterAction : function(){
					ACC.imagegallery.syncPosition($image,$carousel,this.currentItem)
					$image.data("zoomEnable",true)				
				},
				startDragging: function(){
					
					$image.data("zoomEnable",false)
				},
				afterLazyLoad:function(e){

					var b = $image.data("owlCarousel") || {}
					if(!b.currentItem){
						b.currentItem = 0
					}
	
					var $e=$($image.find("img.lazyOwl")[b.currentItem]);
					startZoom($e.parent())
				}
			});


			$carousel.owlCarousel({
				navigation:true,
				navigationText : ["<span class='glyphicon glyphicon-chevron-left'></span>", "<span class='glyphicon glyphicon-chevron-right'></span>"],
				pagination:false,
				items:2,
				itemsDesktop : [5000,7], 
				itemsDesktopSmall : [1200,5], 
				itemsTablet: [768,4], 
				itemsMobile : [480,3], 
				lazyLoad:true,
				afterAction : function(){

				},
			});


			$carousel.on("click","a.item",function(e){
				e.preventDefault();
				$image.trigger("owl.goTo",$(this).parent(".owl-item").data("owlItem"));
			})



			function startZoom(e){
			


				$(e).zoom({
					url: $(e).find("img.lazyOwl").data("zoomImage"),
					touch: true,
					on: "mouseover",
					touchduration:150,

					onZoomIn:function(){
					
					},

					onZoomOut:function(){
						var owl = $image.data('owlCarousel');
						owl.dragging(true)
						$image.data("zoomEnable",true)
					},

					zoomEnableCallBack:function(){
						var bool = $image.data("zoomEnable")

						var owl = $image.data('owlCarousel');
						if(bool==false){
							owl.dragging(true)
						}
						else{

						 	owl.dragging(false)
						}
						return bool;
					}
				});
			}
		})
	},


	syncPosition: function($image,$carousel,currentItem){
		$carousel.trigger("owl.goTo",currentItem);
	}
};